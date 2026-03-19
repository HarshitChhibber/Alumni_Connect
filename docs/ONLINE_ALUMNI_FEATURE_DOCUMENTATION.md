# Online Alumni Notification & Quick Connect Feature

## Overview

This feature enables students to receive real-time notifications when alumni from their university come online, and allows them to send connection requests directly from the notification popup. Alumni can accept these requests and start messaging immediately.

## How It Works

### 1. **Student Perspective**

#### Receiving Notifications
- When a student logs in and connects via WebSocket, they are subscribed to alumni online/offline events
- When an alumni comes online (same university), the student receives a real-time notification
- A popup badge appears in the bottom-right corner showing the online alumni

#### Sending Connection Request
- Student can click the "Connect" button on the notification badge
- A modal popup opens showing the alumni's profile details:
  - Profile picture
  - Name
  - Current company
  - Batch/graduation year
  - Location
  - Skills (first 5)
- Student can optionally write a personal message (max 500 characters)
- Clicking "Send Connection Request" creates a connection request via WebSocket or REST API

#### Accepting Connection Response
- When alumni accepts the request, student receives a real-time notification: "Alumni accepted your connection request!"
- Chat automatically starts between them
- They can begin messaging immediately

### 2. **Alumni Perspective**

#### Receiving Requests
- When alumni comes online, they start receiving real-time student connection requests
- A popup notification appears in the bottom-left corner showing:
  - Student's profile picture
  - Student's name
  - Message preview
  - "Accept" button

#### Accepting Connection
- Alumni clicks "Accept" button
- Connection is established
- Chat conversation is automatically created
- Both can now message each other

## Backend Implementation

### Models

#### OnlineAlumniNotification
Located in: `backend/models/OnlineAlumniNotification.js`

```javascript
{
  student: ObjectId,           // Student who receives notification
  alumni: ObjectId,            // Alumni who came online
  connectionRequest: ObjectId, // Reference to ConnectionRequest if sent
  status: String,              // 'online', 'offline', 'connection_sent', 'connection_accepted'
  timestamp: Date              // When alumni came online
}
```

**Note**: This model is INTERNAL ONLY - not exposed via REST API. It tracks notifications server-side for context.

### WebSocket Events

#### Emitted by Server

**For Students:**
- `alumni-online`: Emitted when alumni comes online
- `alumni-offline`: Emitted when alumni goes offline
- `connection-accepted`: Emitted when alumni accepts student's request
- `request-sent`: Confirmation that connection request was sent
- `request-error`: Error when sending request

**For Alumni:**
- `student-connection-request`: Incoming connection request from student
- `accept-success`: Confirmation that request was accepted
- `accept-error`: Error when accepting request

#### Received by Server

**From Students:**
- `send-connection-request`: Student sends connection request
  ```javascript
  {
    alumniId: String,
    message: String (optional)
  }
  ```

**From Alumni:**
- `accept-connection-request`: Alumni accepts student's request
  ```javascript
  {
    studentId: String
  }
  ```

### REST API Endpoints

#### Notification Routes (`/api/notifications`)

1. **GET `/online-alumni`** ✅
   - Returns list of currently online alumni from same university
   - Students only
   - Cached fallback for WebSocket

2. **GET `/history`** ✅
   - Returns notification history (last 30 days)
   - Students only
   - Internal tracking

3. **POST `/send-connection-request`** ✅
   - Creates a connection request via REST (WebSocket fallback)
   - Body: `{ alumniId, message }`
   - Students only

4. **POST `/accept-connection-request`** ✅
   - Alumni accepts a student's request
   - Body: `{ studentId }`
   - Alumni only
   - Creates Conversation automatically

5. **POST `/clear`** ✅
   - Clears a notification record
   - Body: `{ alumniId }`
   - Students only

### Server Configuration

**File**: `backend/server.js`

- Socket.IO configured with JWT authentication
- User online status tracked in `User` model
- `connectedUsers` Map stores active connections
- Automatic university-scoped notifications
- University match verification for all requests

## Frontend Implementation

### Components

#### OnlineAlumniNotificationPopup
**Location**: `frontend/alumni_connect/src/components/OnlineAlumniNotificationPopup.jsx`

**Features:**
- Displays notification badges for online alumni (bottom-right)
- Click "Connect" to open modal
- Modal shows alumni profile details
- Optional message input (500 chars max)
- "Send Connection Request" button
- Dismiss button on badges
- Real-time updates

**Styling**: `OnlineAlumniNotificationPopup.css`
- Slide-in animations
- Gradient headers
- Responsive design
- Mobile-friendly

#### AlumniConnectionRequestsPopup
**Location**: `frontend/alumni_connect/src/components/AlumniConnectionRequestsPopup.jsx`

**Features:**
- Displays incoming connection requests (bottom-left)
- Shows student profile picture, name, message
- "Accept" button to accept request
- Dismiss button to ignore
- Automatic chat creation on accept
- Real-time updates

**Styling**: `AlumniConnectionRequestsPopup.css`
- Slide-in from left animations
- Orange color scheme for alumni
- Responsive design

### SocketContext Updates
**Location**: `frontend/alumni_connect/src/context/SocketContext.jsx`

**New State:**
- `connectionRequests`: Stores incoming requests for alumni
- `onlineAlumniNotifications`: Stores online alumni for students

**New Methods:**
- `sendConnectionRequest(alumniId, message)`: Sends request via WebSocket
- `acceptConnectionRequest(studentId)`: Accepts request via WebSocket
- `removeConnectionRequest(studentId)`: Removes request from UI

**Event Listeners:**
- All WebSocket events mapped to state updates
- Custom window events dispatched for component coordination

### Connection Service Updates
**Location**: `frontend/alumni_connect/src/api/connectionService.js`

**New Methods:**
```javascript
sendConnectionRequestViaNotification(alumniId, message)
acceptConnectionRequestViaNotification(studentId)
getNotificationHistory()
clearNotification(alumniId)
```

### App Integration
**Location**: `frontend/alumni_connect/src/App.jsx`

Both notification components are rendered at root level:
```jsx
<SocketProvider>
  <OnlineAlumniNotificationPopup />
  <AlumniConnectionRequestsPopup />
  <Routes>...</Routes>
</SocketProvider>
```

## User Flow Diagram

### Student Flow
```
1. Student logs in
   ↓
2. WebSocket connects (socket.io)
   ↓
3. Alumni comes online (same university)
   ↓
4. Server emits 'alumni-online' event
   ↓
5. Student sees notification badge (bottom-right)
   ↓
6. Student clicks "Connect"
   ↓
7. Modal opens with alumni profile
   ↓
8. Student writes optional message
   ↓
9. Student clicks "Send Connection Request"
   ↓
10. WebSocket emits 'send-connection-request'
    ↓
11. Server validates & saves connection request
    ↓
12. Server emits 'request-sent' to student
    ↓
13. Server emits 'student-connection-request' to alumni (if online)
    ↓
14. [WAIT FOR ALUMNI RESPONSE]
    ↓
15. Alumni accepts request
    ↓
16. Server creates Conversation & Message
    ↓
17. Server emits 'connection-accepted' to student
    ↓
18. Student navigates to chat
    ↓
19. ✅ MESSAGING STARTS
```

### Alumni Flow
```
1. Alumni logs in
   ↓
2. WebSocket connects (socket.io)
   ↓
3. Server updates isOnline = true
   ↓
4. Notifies all online students from same university
   ↓
5. Alumni sees incoming connection requests in real-time
   ↓
6. Connection request popup appears (bottom-left)
   ↓
7. Alumni clicks "Accept"
   ↓
8. WebSocket emits 'accept-connection-request'
   ↓
9. Server creates Conversation & Message
   ↓
10. Server emits 'connection-accepted' to student
    ↓
11. Server emits 'accept-success' to alumni
    ↓
12. ✅ BOTH CAN START MESSAGING
```

## Security Features

✅ **University Scoping**: Students can only connect with alumni from same university
✅ **Role Verification**: Only students can send, only alumni can accept
✅ **Duplicate Prevention**: Cannot send duplicate pending requests
✅ **Authentication**: All WebSocket and REST endpoints require JWT token
✅ **Authorization**: User can only access their own notifications
✅ **Data Validation**: Message length limited to 500 chars

## Fallback Mechanisms

- If WebSocket disconnects, REST API endpoints work as backup
- `send-connection-request` endpoint available at `/api/notifications/send-connection-request`
- `accept-connection-request` endpoint available at `/api/notifications/accept-connection-request`
- Both endpoints create proper database records

## Testing the Feature

### Manual Testing Steps

#### For Students:
1. Open 2 browser windows (Student + Alumni)
2. Log in as student in window 1
3. Log in as alumni in window 2
4. Check "Online alumni from same university" appears in window 1
5. Click "Connect" on notification
6. Write a message
7. Click "Send Connection Request"
8. In window 2 (alumni), see incoming request notification
9. Click "Accept"
10. Both windows show chat is available
11. Exchange messages to verify

#### For Alumni:
1. Incoming requests appear in bottom-left popup
2. Accept button works and creates chat
3. Multiple requests can be managed

## Future Enhancements

- [ ] Typing indicators
- [ ] Read receipts for messages
- [ ] Video/audio call integration
- [ ] Rich media support (images, files)
- [ ] Message encryption
- [ ] Notification persistence (browser notifications)
- [ ] Request expiration (requests older than 7 days auto-decline)
- [ ] Mutual connection indicator
- [ ] Alumni can also send connection requests to students

## Dependencies Used

- **socket.io**: Real-time bidirectional communication
- **express**: REST API endpoints
- **mongoose**: Database modeling
- **bcrypt**: Password hashing (existing)
- **jsonwebtoken**: Authentication (existing)

## Files Modified/Created

### Backend
- ✅ `models/OnlineAlumniNotification.js` (NEW)
- ✅ `server.js` (MODIFIED - WebSocket handlers)
- ✅ `controllers/notificationController.js` (MODIFIED - new methods)
- ✅ `routes/notificationRoutes.js` (MODIFIED - new endpoints)

### Frontend
- ✅ `components/OnlineAlumniNotificationPopup.jsx` (NEW)
- ✅ `components/OnlineAlumniNotificationPopup.css` (NEW)
- ✅ `components/AlumniConnectionRequestsPopup.jsx` (UPDATED)
- ✅ `components/AlumniConnectionRequestsPopup.css` (UPDATED)
- ✅ `context/SocketContext.jsx` (MODIFIED)
- ✅ `api/connectionService.js` (MODIFIED)
- ✅ `App.jsx` (MODIFIED - component integration)

## Troubleshooting

### Notifications not appearing
- Check WebSocket connection in browser console
- Verify JWT token is valid
- Check university field matches between student and alumni
- Ensure both users are in `isOnline: true` state

### Connection requests not sending
- Check network tab for API calls
- Verify no existing pending request between same users
- Check browser console for errors
- Try REST API fallback

### Chat not starting after accept
- Refresh page after accepting
- Check Conversation collection in MongoDB
- Verify Message was created
- Check chatService is properly initialized

## Notes for Developers

1. **OnlineAlumniNotification is internal tracking** - Not exposed via REST by design
2. **Always verify university match** - Critical security feature
3. **WebSocket events use custom naming** - Different from HTTP routes
4. **Both WebSocket and REST endpoints work** - Redundancy for reliability
5. **Notifications auto-clear on alumni offline** - Clean user experience
6. **Messages are optional** - Default message provided if none given
