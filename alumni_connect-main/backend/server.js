import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import Connectdb from "./db/db.js";
import User from "./models/User.js";
import OnlineAlumniNotification from "./models/OnlineAlumniNotification.js";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser"; // Import body-parser

// --- Route Imports ---
import authRoutes from "./routes/User.js";
import adminRoutes from "./routes/adminRoutes.js";
import workshopRoutes from "./routes/workshopRoutes.js";
import alumniRoutes from "./routes/alumniRoutes.js";
import studentRoutes from "./routes/studentRoutes.js"; // NEW: For Student Explorer
import chatRoutes from "./routes/chatRoutes.js";       // NEW: For Chat System
import profileRoutes from "./routes/profileRoutes.js"; // NEW: For Profile Management
import connectionRoutes from './routes/connectionRoutes.js';
import StudentDashboardRoutes from "./routes/studentDashboardRoutes.js"; // NEW: For Student Dashboard
import notificationRoutes from "./routes/notificationRoutes.js"; // NEW: For Notifications
dotenv.config();

const app = express();

// Middleware
app.use(cors());

app.use(express.json({ limit: "50mb" })); 
app.use(bodyParser.json()); // Use body-parser for JSON parsing
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// Connect DB
Connectdb();
app.use('/api/connections', connectionRoutes);
// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/workshops", workshopRoutes);
app.use("/api/alumni", alumniRoutes);

// New Routes added for recent features

app.use("/api/chat", chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/students", StudentDashboardRoutes);
app.use("/api/notifications", notificationRoutes);
// Default Route
app.get("/", (req, res) => {
  res.send("Alumni Connect Backend Running 🚀");
});
app.use('/api/student', studentRoutes);
// Error handling (basic)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the stack trace for debugging
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// DEBUG: Emit an 'alumni-online' event for testing (POST { alumniId })
app.post('/api/debug/emit-alumni-online', async (req, res) => {
  try {
    const { alumniId } = req.body;
    if (!alumniId) return res.status(400).json({ error: 'alumniId required' });

    const alumni = await User.findById(alumniId).select('university name');
    if (!alumni) return res.status(404).json({ error: 'Alumni not found' });

    const students = await User.find({ role: 'student', university: alumni.university }).select('_id');
    students.forEach(student => {
      const sid = connectedUsers.get(String(student._id));
      if (sid) {
        io.to(sid).emit('alumni-online', { alumniId, message: 'Test: alumni online' });
      }
    });

    return res.json({ success: true, notified: students.length });
  } catch (err) {
    console.error('Debug emit failed:', err);
    return res.status(500).json({ error: 'internal' });
  }
});

// DEBUG: Return a sample alumni userId (first found) for testing
app.get('/api/debug/get-sample-alumni', async (req, res) => {
  try {
    const alumni = await User.findOne({ role: 'alumni' }).select('_id name university');
    if (!alumni) return res.status(404).json({ error: 'No alumni found' });
    return res.json({ alumniId: alumni._id, name: alumni.name, university: alumni.university });
  } catch (err) {
    console.error('Debug get-sample-alumni failed:', err);
    return res.status(500).json({ error: 'internal' });
  }
});

const PORT = process.env.PORT || 3000;

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('role university');
    
    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.userId = decoded.id;
    socket.userRole = user.role;
    socket.userUniversity = user.university;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

// Store connected users
const connectedUsers = new Map(); // userId -> socketId

// Socket.IO connection handling
io.on("connection", async (socket) => {
  const userId = socket.userId;
  const userRole = socket.userRole;
  const userUniversity = socket.userUniversity;

  console.log(`User connected: ${userId} (${userRole})`);

  // Store connection
  connectedUsers.set(userId, socket.id);

  // Update user online status
  await User.findByIdAndUpdate(userId, {
    isOnline: true,
    lastSeen: new Date()
  });

  // If alumni comes online, notify all students from same university
  if (userRole === 'alumni') {
    const students = await User.find({
      role: 'student',
      university: userUniversity
    }).select('_id');

    console.log(`📢 Alumni ${userId} from ${userUniversity} came online. Notifying ${students.length} students`);

    students.forEach(student => {
      const studentSocketId = connectedUsers.get(student._id.toString());
      if (studentSocketId) {
        console.log(`📩 Sending alumni-online notification to student ${student._id}`);
        io.to(studentSocketId).emit('alumni-online', {
          alumniId: userId,
          message: 'An alumni is now online'
        });
      } else {
        console.log(`⚠️ Student ${student._id} not connected`);
      }
    });
  }

  // Handle incoming connection request from student to alumni
  socket.on('send-connection-request', async (data) => {
    try {
      const { alumniId, message } = data;
      const studentId = userId;

      // Verify the student
      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        socket.emit('request-error', { error: 'Only students can send connection requests' });
        return;
      }

      // Verify the alumni
      const alumni = await User.findById(alumniId);
      if (!alumni || alumni.role !== 'alumni') {
        socket.emit('request-error', { error: 'Invalid alumni' });
        return;
      }

      // Verify university match
      if (student.university !== alumni.university) {
        socket.emit('request-error', { error: 'You can only connect with alumni from your university' });
        return;
      }

      // Save notification to database (backend only, not exposed)
      await OnlineAlumniNotification.findOneAndUpdate(
        { student: studentId, alumni: alumniId },
        { status: 'connection_sent' },
        { upsert: true }
      );

      // Notify the alumni if they're online
      const alumniSocketId = connectedUsers.get(alumniId);
      if (alumniSocketId) {
        io.to(alumniSocketId).emit('student-connection-request', {
          studentId: studentId,
          studentName: student.name,
          studentProfilePicture: student.profilePicture,
          message: message || `${student.name} wants to connect with you!`,
          timestamp: new Date()
        });

        // Send confirmation to student
        socket.emit('request-sent', { success: true, message: 'Connection request sent!' });
      } else {
        socket.emit('request-sent', { success: true, message: 'Alumni is offline, request saved' });
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      socket.emit('request-error', { error: 'Failed to send request' });
    }
  });

  // Handle alumni accepting a student's connection request
  socket.on('accept-connection-request', async (data) => {
    try {
      const { studentId } = data;
      const alumniId = userId;

      // Verify the alumni
      const alumni = await User.findById(alumniId);
      if (!alumni || alumni.role !== 'alumni') {
        socket.emit('accept-error', { error: 'Only alumni can accept requests' });
        return;
      }

      // Update notification status
      await OnlineAlumniNotification.findOneAndUpdate(
        { student: studentId, alumni: alumniId },
        { status: 'connection_accepted' },
        { upsert: true }
      );

      // Notify the student that connection was accepted
      const studentSocketId = connectedUsers.get(studentId);
      if (studentSocketId) {
        io.to(studentSocketId).emit('connection-accepted', {
          alumniId: alumniId,
          alumniName: alumni.name,
          message: `${alumni.name} accepted your connection request!`,
          timestamp: new Date()
        });
      }

      // Send confirmation to alumni
      socket.emit('accept-success', { success: true, message: 'Connection request accepted!' });
    } catch (error) {
      console.error('Error accepting connection request:', error);
      socket.emit('accept-error', { error: 'Failed to accept request' });
    }
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${userId}`);
    connectedUsers.delete(userId);

    // Update user offline status
    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date()
    });

    // If alumni goes offline, notify students
    if (userRole === 'alumni') {
      const students = await User.find({
        role: 'student',
        university: userUniversity,
        isOnline: true
      }).select('_id');

      students.forEach(student => {
        const studentSocketId = connectedUsers.get(student._id.toString());
        if (studentSocketId) {
          io.to(studentSocketId).emit('alumni-offline', {
            alumniId: userId
          });
        }
      });
    }
  });

  // Handle ping to keep connection alive
  socket.on("ping", () => {
    socket.emit("pong");
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready`);
});