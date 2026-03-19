import Workshop from "../models/Workshops.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js"; // ✅ Added for Admin-Alumni Chat
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const generateMeetingCode = () => {
  return `WK-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// ==========================================
// 1. ALUMNI: CREATE & MANAGE WORKSHOPS
// ==========================================

// POST /api/workshops (Standard Online Workshop)
export const createWorkshop = async (req, res) => {
  try {
    const { title, description, date, time, mode, price, capacity, tags } = req.body;

    let imageUrl = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80";
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    }

    const newWorkshop = await Workshop.create({
      organizer: req.user._id,
      title,
      description,
      date,
      time,
      mode,
      price: Number(price) || 0,
      capacity: Number(capacity) || 100,
      tags: tags ? tags.split(',').map(t => t.trim()) : [], 
      image: imageUrl, 
      meetingCode: mode === "Online" ? generateMeetingCode() : null,
      registeredUsers: [],
      status: "Published" // Online events are published immediately
    });

    res.status(201).json({ success: true, workshop: newWorkshop });
  } catch (error) {
    console.error("Create Workshop Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/workshops/request-venue (Offline Workshop Request) [NEW]
export const requestVenue = async (req, res) => {
  try {
    const { title, description, date, time, requirements, capacity } = req.body;

    const newWorkshop = await Workshop.create({
      organizer: req.user._id,
      title,
      description,
      date,
      time,
      capacity: Number(capacity) || 50,
      mode: 'Offline', 
      venueRequest: {
        requirements: requirements // e.g., "Need projector"
      },
      status: 'Pending' // ✅ HIDDEN from students until approved
    });

    res.status(201).json({ success: true, message: "Venue request sent to Admin", workshop: newWorkshop });
  } catch (error) {
    console.error("Request Venue Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/workshops?tab=upcoming|past|drafts
// GET /api/workshops?tab=upcoming|past|drafts
export const getMyWorkshops = async (req, res) => {
  try {
    const { tab } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = { status: { $ne: "Cancelled" } };

    // 1. If Alumni: Filter by their own ID
    if (req.user.role === 'alumni') {
        query.organizer = req.user._id;
    } 
    // 2. If Admin: Filter by University
    else if (req.user.role === 'admin') {
        const universityAlumni = await User.find({ 
            university: req.user.university, 
            role: 'alumni' 
        }).distinct('_id');

        query.organizer = { $in: universityAlumni };
    }

    // Tab Logic
    if (tab === "drafts") {
      if (req.user.role === 'admin') query.status = "Pending";
      else query.status = { $in: ["Draft", "Pending"] }; 
    } else if (tab === "past") {
      query.date = { $lt: today };
      if (req.user.role === 'alumni') query.status = { $in: ["Published", "Approved"] };
    } else {
      query.date = { $gte: today };
    }

    const workshops = await Workshop.find(query)
        .populate('organizer', 'name') 
        .sort({ date: 1 });

    const formattedWorkshops = workshops.map(ws => ({
      id: ws._id,
      title: ws.title,
      organizerName: ws.organizer?.name || "Unknown", 
      date: ws.date.toISOString().split('T')[0],
      time: ws.time,
      attendees: ws.registeredUsers.length,
      image: ws.image,
      status: ws.status,
      mode: ws.mode,
      price: ws.price,
      venueRequest: ws.venueRequest,
      assignedVenue: ws.assignedVenue,
      meetingCode: ws.meetingCode // ✅ ADDED THIS LINE
    }));

    res.json(formattedWorkshops);
  } catch (error) {
    console.error("Get Workshops Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// DELETE /api/workshops/:id
export const deleteWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id).populate('organizer');
    if (!workshop) return res.status(404).json({ message: "Not found" });

    // Allow if Owner OR if Admin of same University
    const isOwner = workshop.organizer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' && workshop.organizer.university === req.user.university;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await workshop.deleteOne();
    res.json({ message: "Workshop cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/workshops/stats
export const getWorkshopStats = async (req, res) => {
  try {
    let matchStage = { status: { $ne: "Cancelled" } };

    if (req.user.role === 'alumni') {
        matchStage.organizer = req.user._id;
    } else if (req.user.role === 'admin') {
        const universityAlumni = await User.find({ 
            university: req.user.university, 
            role: 'alumni' 
        }).distinct('_id');
        matchStage.organizer = { $in: universityAlumni };
    }

    const stats = await Workshop.aggregate([
      { $match: matchStage },
      {
        $project: {
          registrations: { $size: "$registeredUsers" },
          revenue: { $multiply: [{ $size: "$registeredUsers" }, "$price"] }
        }
      },
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: "$registrations" },
          totalRevenue: { $sum: "$revenue" }
        }
      }
    ]);

    const result = stats[0] || { totalRegistrations: 0, totalRevenue: 0 };
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 2. ADMIN: APPROVE VENUES [NEW]
// ==========================================

// GET /api/workshops/admin/pending-venues
export const getPendingVenueRequests = async (req, res) => {
  try {
    const adminUniversity = req.user.university;

    const requests = await Workshop.find({ status: 'Pending', mode: 'Offline' })
      .populate({
        path: 'organizer',
        match: { university: adminUniversity }, // Security: Only my uni
        select: 'name profilePicture currentRole'
      });

    const filteredRequests = requests.filter(w => w.organizer !== null);
    res.json(filteredRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/workshops/admin/approve-venue
export const approveVenue = async (req, res) => {
  try {
    const { workshopId, assignedVenue, adminNote } = req.body;
    
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) return res.status(404).json({ message: "Not found" });

    // 1. Update Workshop
    workshop.status = 'Published'; // ✅ Now visible to Students
    workshop.assignedVenue = assignedVenue;
    workshop.adminNote = adminNote;
    await workshop.save();

    // 2. Auto-Start Chat (Admin <-> Alumni)
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, workshop.organizer] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, workshop.organizer],
        lastMessage: {
          text: `Venue Approved for "${workshop.title}": ${assignedVenue}. ${adminNote}`,
          sender: req.user._id,
          createdAt: new Date()
        }
      });
    }

    res.json({ success: true, message: "Venue assigned and Chat started" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 3. STUDENT: EXPLORE & REGISTER
// ==========================================

export const getAllWorkshops = async (req, res) => {
  try {
    const { search, filter } = req.query;
    const myUniversity = req.user.university;
    const today = new Date();
    today.setHours(0,0,0,0);

    const localAlumni = await User.find({ 
        role: 'alumni', 
        university: myUniversity 
    }).select('_id');

    const alumniIds = localAlumni.map(u => u._id);

    let query = { 
        status: "Published", // ✅ Only shows approved/published workshops
        organizer: { $in: alumniIds }
    };

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { tags: { $in: [regex] } }];
    }

    if (filter === "Upcoming") query.date = { $gte: today };
    else if (filter === "Free") query.price = 0;
    else if (filter === "Paid") query.price = { $gt: 0 };

    let workshops = await Workshop.find(query)
      .populate("organizer", "name avatar currentCompany currentRole university")
      .sort({ date: 1 });

    if (filter === "Popular") {
      workshops.sort((a, b) => b.registeredUsers.length - a.registeredUsers.length);
    }

    const formatted = workshops.map(ws => ({
      id: ws._id,
      title: ws.title,
      host: ws.organizer?.name || "Alumni",
      hostRole: ws.organizer?.currentRole 
        ? `${ws.organizer.currentRole} @ ${ws.organizer.currentCompany || 'Tech'}`
        : "Alumni Member",
      hostImg: ws.organizer?.avatar || "",
      date: new Date(ws.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: ws.time,
      price: ws.price,
      seats: ws.capacity,
      seatsFilled: ws.registeredUsers.length,
      image: ws.image,
      tags: ws.tags || [],
      // Show Venue if offline
      venue: ws.mode === 'Offline' ? ws.assignedVenue : 'Online', 
      isRegistered: ws.registeredUsers.some(id => id.toString() === req.user._id.toString())
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Explore Workshops Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 4. PAYMENT & REGISTRATION
// ==========================================

export const createWorkshopOrder = async (req, res) => {
  try {
    const studentUniversity = req.user.university;
    const workshop = await Workshop.findById(req.params.id).populate("organizer", "university");
    
    if (!workshop) return res.status(404).json({ message: "Workshop not found" });

    if (workshop.organizer?.university !== studentUniversity) {
        return res.status(403).json({ message: "Restricted: This workshop is for a different university." });
    }

    if (workshop.registeredUsers.includes(req.user._id)) {
      return res.status(400).json({ message: "Already registered" });
    }
    if (workshop.registeredUsers.length >= workshop.capacity) {
      return res.status(400).json({ message: "Workshop is full" });
    }

    if (workshop.price === 0) return res.json({ isFree: true });

    const shortReceipt = `wk_${workshop._id.toString().slice(-6)}_${Date.now()}`;
    const options = {
      amount: workshop.price * 100, 
      currency: "INR",
      receipt: shortReceipt, 
    };

    const order = await instance.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("Payment Init Error:", error);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};

export const verifyWorkshopPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, workshopId } = req.body;
    const studentId = req.user._id;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid Payment Signature" });
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop.registeredUsers.includes(studentId)) {
        workshop.registeredUsers.push(studentId);
        await workshop.save();
    }

    res.json({ success: true, message: "Payment successful and Registered!" });
  } catch (error) {
    res.status(500).json({ message: "Payment verification failed" });
  }
};

export const registerForWorkshop = async (req, res) => {
  try {
    const workshopId = req.params.id;
    const studentId = req.user._id;
    const studentUniversity = req.user.university;

    const workshop = await Workshop.findById(workshopId).populate("organizer", "university");
    if (!workshop) return res.status(404).json({ message: "Workshop not found" });

    if (workshop.organizer?.university !== studentUniversity) {
        return res.status(403).json({ message: "Restricted." });
    }

    if (workshop.price > 0) {
        return res.status(400).json({ message: "This is a paid workshop." });
    }

    if (workshop.registeredUsers.includes(studentId)) {
      return res.status(400).json({ message: "Already registered" });
    }

    if (workshop.registeredUsers.length >= workshop.capacity) {
      return res.status(400).json({ message: "Workshop is full" });
    }

    workshop.registeredUsers.push(studentId);
    await workshop.save();

    res.json({ success: true, message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentWorkshops = async (req, res) => {
  try {
    const studentId = req.user._id;
    const now = new Date(); 

    const workshops = await Workshop.find({ 
      registeredUsers: studentId,
      status: "Published"
    }).populate("organizer", "name");

    const registered = [];
    const completed = [];

    workshops.forEach(ws => {
      const wsDate = new Date(ws.date);
      const [hours, minutes] = ws.time.split(':').map(Number);
      
      const workshopStart = new Date(wsDate.getFullYear(), wsDate.getMonth(), wsDate.getDate(), hours, minutes);
      
      const diffMs = workshopStart - now;
      const diffMins = diffMs / 1000 / 60;
      const isSameDay = workshopStart.toDateString() === now.toDateString();
      const isAboutToStart = diffMins <= 15 && diffMins > -180;
      const shouldShowCode = isSameDay || isAboutToStart;

      const wsData = {
        id: ws._id,
        title: ws.title,
        date: new Date(ws.date).toLocaleDateString(),
        time: ws.time,
        image: ws.image,
        host: ws.organizer?.name,
        // Only show code for Online, show Venue for Offline
        meetingCode: ws.mode === 'Online' && shouldShowCode ? ws.meetingCode : null, 
        venue: ws.mode === 'Offline' ? ws.assignedVenue : null,
        canJoin: shouldShowCode
      };

      if (diffMins < -180) completed.push(wsData);
      else registered.push(wsData);
    });

    res.json({ registered, completed });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};