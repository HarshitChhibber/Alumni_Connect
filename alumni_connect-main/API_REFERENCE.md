# API Reference - Online Alumni Notification System

## WebSocket Events

### Student Events (Incoming)

#### `alumni-online`
Emitted when an alumni from the same university comes online.

```javascript
// Server -> Student
socket.on('alumni-online', (data) => {
  // data: {
  //   alumniId: "userId123",
  //   message: "An alumni is now online"
  // }
});
```

#### `alumni-offline`
Emitted when an alumni goes offline.

```javascript
// Server -> Student
socket.on('alumni-offline', (data) => {
  // data: {
  //   alumniId: "userId123"
  // }
});
```

#### `connection-accepted`
Emitted when alumni accepts student's connection request.

```javascript
// Server -> Student
socket.on('connection-accepted', (data) => {
  // data: {
  //   alumniId: "alumniUserId",
  //   alumniName: "John Alumni",
  //   message: "John Alumni accepted your connection request!",
  //   timestamp: "2024-01-15T10:30:00Z"
  // }
});
```

#### `request-sent`
Confirmation that connection request was sent.

```javascript
// Server -> Student
socket.on('request-sent', (data) => {
  // data: {
  //   success: true,
  //   message: "Connection request sent!"
  // }
});
```

#### `request-error`
Error when sending connection request.

```javascript
// Server -> Student
socket.on('request-error', (data) => {
  // data: {
  //   error: "You can only connect with alumni from your university"
  // }
});
```

---

### Alumni Events (Incoming)

#### `student-connection-request`
Emitted when a student sends a connection request.

```javascript
// Server -> Alumni
socket.on('student-connection-request', (data) => {
  // data: {
  //   studentId: "studentUserId",
  //   studentName: "Jane Student",
  //   studentProfilePicture: "https://...",
  //   message: "Hi! I'd like to connect with you",
  //   timestamp: "2024-01-15T10:30:00Z"
  // }
});
```

#### `accept-success`
Confirmation that connection was accepted.

```javascript
// Server -> Alumni
socket.on('accept-success', (data) => {
  // data: {
  //   success: true,
  //   message: "Connection request accepted!"
  // }
});
```

#### `accept-error`
Error when accepting connection request.

```javascript
// Server -> Alumni
socket.on('accept-error', (data) => {
  // data: {
  //   error: "Only alumni can accept requests"
  // }
});
```

---

### Student Events (Outgoing)

#### `send-connection-request`
Send a connection request to an alumni.

```javascript
// Student -> Server
socket.emit('send-connection-request', {
  alumniId: "alumniUserId",
  message: "Hi! I'd like to connect with you" // optional
});
```

---

### Alumni Events (Outgoing)

#### `accept-connection-request`
Accept a student's connection request.

```javascript
// Alumni -> Server
socket.emit('accept-connection-request', {
  studentId: "studentUserId"
});
```

---

### General Events

#### `ping` / `pong`
Keep-alive mechanism to maintain connection.

```javascript
// Student/Alumni -> Server (every 30 seconds)
socket.emit('ping');

// Server -> Student/Alumni
socket.on('pong', () => {
  // Connection is alive
});
```

---

## REST API Endpoints

### Base URL
```
http://localhost:8080/api/notifications
```

### Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Get Online Alumni

**Endpoint**: `GET /online-alumni`

**Method**: GET

**Role**: Student only

**Description**: Get list of currently online alumni from the same university.

**Request**:
```bash
curl -X GET http://localhost:8080/api/notifications/online-alumni \
  -H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "onlineAlumni": [
    {
      "_id": "alumniId1",
      "name": "John Alumni",
      "profilePicture": "https://...",
      "currentCompany": "Google",
      "location": "San Francisco",
      "batch": "2020",
      "skills": ["Python", "React", "Node.js"],
      "graduationYear": 2020
    },
    {
      "_id": "alumniId2",
      "name": "Sarah Alumni",
      "profilePicture": "https://...",
      "currentCompany": "Microsoft",
      "location": "Seattle",
      "batch": "2019",
      "skills": ["Java", "AWS", "Kubernetes"],
      "graduationYear": 2019
    }
  ]
}
```

**Error Response**:
```json
{
  "message": "Only students can view online alumni notifications."
}
```

---

### 2. Get Notification History

**Endpoint**: `GET /history`

**Method**: GET

**Role**: Student only

**Description**: Get notification history for the last 30 days.

**Request**:
```bash
curl -X GET http://localhost:8080/api/notifications/history \
  -H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "notifications": [
    {
      "_id": "notificationId1",
      "student": "studentId",
      "alumni": {
        "_id": "alumniId1",
        "name": "John Alumni",
        "profilePicture": "https://...",
        "currentCompany": "Google",
        "batch": "2020"
      },
      "connectionRequest": "requestId1",
      "status": "connection_accepted",
      "timestamp": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 3. Send Connection Request

**Endpoint**: `POST /send-connection-request`

**Method**: POST

**Role**: Student only

**Description**: Send a connection request to an alumni (REST fallback).

**Request**:
```bash
curl -X POST http://localhost:8080/api/notifications/send-connection-request \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "alumniId": "alumniUserId",
    "message": "Hi! I would like to learn from your experience."
  }'
```

**Body Parameters**:
```json
{
  "alumniId": "string (required)",
  "message": "string (optional, max 500 chars)"
}
```

**Response** (Success):
```json
{
  "message": "Connection request sent successfully.",
  "requestId": "connectionRequestId"
}
```

**Response** (Error):
```json
{
  "error": "You can only connect with alumni from your university"
}
```

**Possible Errors**:
- `"Invalid alumni"` - Alumni not found
- `"You can only connect with alumni from your university"` - University mismatch
- `"Connection request already exists"` - Duplicate request
- `"Only students can send connection requests"` - User is not a student

---

### 4. Accept Connection Request

**Endpoint**: `POST /accept-connection-request`

**Method**: POST

**Role**: Alumni only

**Description**: Accept a student's connection request and start messaging.

**Request**:
```bash
curl -X POST http://localhost:8080/api/notifications/accept-connection-request \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "studentUserId"
  }'
```

**Body Parameters**:
```json
{
  "studentId": "string (required)"
}
```

**Response** (Success):
```json
{
  "message": "Connection request accepted. Chat enabled.",
  "conversationId": "conversationId123",
  "conversationParticipants": ["studentId", "alumniId"]
}
```

**Response** (Error):
```json
{
  "error": "Connection request not found"
}
```

**Possible Errors**:
- `"Connection request not found"` - No pending request from this student
- `"Only alumni can accept requests"` - User is not an alumni

**Side Effects**:
- Creates `Conversation` document if doesn't exist
- Creates initial `Message` if request had a message
- Updates `OnlineAlumniNotification` status to `connection_accepted`
- Both users can now message each other

---

### 5. Clear Notification

**Endpoint**: `POST /clear`

**Method**: POST

**Role**: Student only

**Description**: Clear/dismiss a notification record.

**Request**:
```bash
curl -X POST http://localhost:8080/api/notifications/clear \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "alumniId": "alumniUserId"
  }'
```

**Body Parameters**:
```json
{
  "alumniId": "string (required)"
}
```

**Response**:
```json
{
  "message": "Notification cleared"
}
```

---

## JavaScript SDK Examples

### Using SocketContext (Recommended)

```javascript
import { useSocket } from '../context/SocketContext';
import { useAuthContext } from '../hooks/useAuth';

function MyComponent() {
  const { 
    socket, 
    onlineAlumniNotifications,
    sendConnectionRequest,
    acceptConnectionRequest 
  } = useSocket();

  // Send connection request
  const handleConnect = (alumniId) => {
    sendConnectionRequest(alumniId, "Hi! Let's connect!");
  };

  // Accept connection request (for alumni)
  const handleAccept = (studentId) => {
    acceptConnectionRequest(studentId);
  };

  return (
    <div>
      {/* Your UI here */}
    </div>
  );
}
```

### Using connectionService (REST Fallback)

```javascript
import { 
  sendConnectionRequestViaNotification,
  acceptConnectionRequestViaNotification,
  getNotificationHistory,
  clearNotification
} from '../api/connectionService';

// Send request
await sendConnectionRequestViaNotification('alumniId', 'Hi there!');

// Accept request
await acceptConnectionRequestViaNotification('studentId');

// Get history
const history = await getNotificationHistory();

// Clear notification
await clearNotification('alumniId');
```

### Manual WebSocket Usage

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Send connection request
socket.emit('send-connection-request', {
  alumniId: 'alumniId123',
  message: 'Hi, let\'s connect!'
});

// Listen for response
socket.on('request-sent', (data) => {
  console.log(data.message); // "Connection request sent!"
});

socket.on('request-error', (data) => {
  console.error(data.error);
});

// Accept connection (for alumni)
socket.emit('accept-connection-request', {
  studentId: 'studentId456'
});

// Listen for incoming requests (alumni)
socket.on('student-connection-request', (data) => {
  console.log(`${data.studentName} wants to connect`);
});
```

---

## Status Codes

### Success
- `200 OK` - Request successful (GET/POST)
- `201 Created` - Resource created (POST)

### Client Errors
- `400 Bad Request` - Invalid parameters or duplicate request
- `403 Forbidden` - User role not allowed or university mismatch
- `404 Not Found` - Alumni, student, or request not found

### Server Errors
- `500 Internal Server Error` - Database or server error

---

## Rate Limiting Recommendations

For production, consider adding rate limits:

```javascript
// Max 10 connection requests per user per hour
// Max 1 accept request per user per second
// Max 5 API calls per user per second
```

---

## Pagination (Future Enhancement)

Current implementation returns up to 10 online alumni and 20 notification records. For future pagination:

```bash
GET /online-alumni?page=1&limit=20
GET /history?page=1&limit=50
```

---

## Filtering (Future Enhancement)

```bash
GET /online-alumni?company=Google&role=alumni
GET /history?status=connection_accepted&from=2024-01-01
```

---

## Database Schema Reference

### OnlineAlumniNotification
```javascript
{
  _id: ObjectId,
  student: ObjectId (ref: User),
  alumni: ObjectId (ref: User),
  connectionRequest: ObjectId (ref: ConnectionRequest) | null,
  status: 'online' | 'offline' | 'connection_sent' | 'connection_accepted',
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date,
  __v: Number
}
```

### ConnectionRequest (Existing)
```javascript
{
  _id: ObjectId,
  sender: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  status: 'pending' | 'accepted' | 'rejected',
  message: String,
  createdAt: Date,
  updatedAt: Date,
  __v: Number
}
```

### Conversation (Existing)
```javascript
{
  _id: ObjectId,
  participants: [ObjectId, ObjectId],
  lastMessage: {
    text: String,
    sender: ObjectId,
    createdAt: Date
  },
  createdAt: Date,
  updatedAt: Date,
  __v: Number
}
```

---

**Last Updated**: January 2024
**API Version**: 1.0
**Status**: Production Ready ✅
