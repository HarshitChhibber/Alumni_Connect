# Setup & Deployment Guide - Online Alumni Notification Feature

## Quick Start

### Backend Setup

1. **Install dependencies** (if not already done):
```bash
cd backend
npm install socket.io
```

2. **Ensure MongoDB models are updated**:
   - `OnlineAlumniNotification.js` is already created
   - ConnectionRequest model already exists
   - Message and Conversation models already exist

3. **Check environment variables** in `.env`:
```
PORT=8080  # or your chosen port
FRONTEND_URL=http://localhost:5173  # for WebSocket CORS
JWT_SECRET=your_secret_key
MONGODB_URI=your_mongodb_connection
```

4. **Start the backend server**:
```bash
npm start
# or
node server.js
```

The server will log:
```
🚀 Server running on port 8080
🔌 WebSocket server ready
```

### Frontend Setup

1. **Install dependencies**:
```bash
cd frontend/alumni_connect
npm install socket.io-client
npm install
```

2. **Check `.env` or environment variables**:
```
VITE_API_URL=http://localhost:8080  # or your backend URL
```

3. **Update `vite.config.js` if needed**:
```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
}
```

4. **Start the frontend dev server**:
```bash
npm run dev
```

Frontend will run at `http://localhost:5173`

## File Checklist

### Backend Files ✅

- [ ] `backend/models/OnlineAlumniNotification.js` - Created
- [ ] `backend/server.js` - Updated with WebSocket handlers
- [ ] `backend/controllers/notificationController.js` - Updated with new methods
- [ ] `backend/routes/notificationRoutes.js` - Updated with new routes

### Frontend Files ✅

- [ ] `frontend/alumni_connect/src/components/OnlineAlumniNotificationPopup.jsx` - Created
- [ ] `frontend/alumni_connect/src/components/OnlineAlumniNotificationPopup.css` - Created
- [ ] `frontend/alumni_connect/src/components/AlumniConnectionRequestsPopup.jsx` - Updated
- [ ] `frontend/alumni_connect/src/components/AlumniConnectionRequestsPopup.css` - Updated
- [ ] `frontend/alumni_connect/src/context/SocketContext.jsx` - Updated
- [ ] `frontend/alumni_connect/src/api/connectionService.js` - Updated
- [ ] `frontend/alumni_connect/src/App.jsx` - Updated

## Testing Checklist

### Unit Testing

```bash
# Backend WebSocket tests
# Create test/websocket.test.js
```

### Integration Testing

1. **Test Alumni Going Online**:
   - Open 2 browser windows
   - Login as alumni in window 1
   - Login as student in window 2
   - Check notification appears in window 2

2. **Test Connection Request**:
   - Click "Connect" on notification
   - Write optional message
   - Click "Send Connection Request"
   - Verify request appears in alumni's popup

3. **Test Accepting Request**:
   - Alumni clicks "Accept"
   - Both users see success message
   - Chat opens automatically
   - Both can message

4. **Test Dismissing**:
   - Click X on notification badge
   - Verify it's removed from UI
   - Alumni offline - notification auto-clears

5. **Test Edge Cases**:
   - Different universities - connection fails
   - Duplicate request - error shown
   - WebSocket disconnect - REST API fallback works
   - Multiple concurrent notifications

## Performance Considerations

### WebSocket Optimization
- Connections stored in memory Map (scales to ~100k concurrent)
- For production, consider Redis for distributed systems
- Add connection pooling for multiple server instances

### Database Optimization
- Add indexes on `OnlineAlumniNotification`:
  ```javascript
  db.onlinealumninotifications.createIndex({ student: 1, alumni: 1 })
  db.onlinealumninotifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }) // 30 days TTL
  ```

### Memory Management
- Limit notification history to 30 days
- Auto-delete old notification records
- Clear disconnected users from Map

## Monitoring

### Key Metrics to Track
1. Active WebSocket connections
2. Connection request success rate
3. Chat initiation rate from notifications
4. Alumni online duration
5. Student notification engagement rate

### Logging

Add to backend:
```javascript
console.log('Alumni online:', alumniId, 'notified', studentCount, 'students');
console.log('Connection request sent:', studentId, '->', alumniId);
console.log('Connection accepted:', studentId, '<->', alumniId);
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] CORS settings correct for production URL
- [ ] WebSocket connection secure (WSS for HTTPS)
- [ ] Database backups scheduled
- [ ] Error logging configured
- [ ] Rate limiting enabled
- [ ] Database indexes created
- [ ] SSL/TLS certificates valid
- [ ] Load balancer configured (if multiple servers)
- [ ] Redis configured (if multiple servers)

## Troubleshooting Guide

### WebSocket Connection Issues

**Problem**: `Connection refused on port 8080`
```
Solution: 
- Check backend server is running
- Check port 8080 is not in use
- Check CORS settings
```

**Problem**: `Authentication error: Invalid token`
```
Solution:
- Check JWT_SECRET matches between backend and frontend
- Check token expiration
- Clear browser cache and re-login
```

### Notification Not Appearing

**Problem**: Alumni online but no notification
```
Solution:
- Check university field in both User documents
- Verify isOnline: true in database
- Check browser console for errors
- Check WebSocket messages in DevTools
```

**Problem**: Connection request fails
```
Solution:
- Check both users exist in database
- Verify no existing pending request
- Check university match
- Check role: student and role: alumni
```

### Chat Not Starting

**Problem**: After accepting, chat doesn't open
```
Solution:
- Check Conversation was created
- Check Message was created
- Refresh the page
- Check chatService is loaded
```

## Rollback Plan

If issues occur:

1. **Stop WebSocket**: Comment out socket handlers in server.js
2. **Disable Notifications**: Remove components from App.jsx
3. **Keep REST API**: Existing connection endpoints still work
4. **Database**: OnlineAlumniNotification data can be safely dropped

## Production Deployment

### Using PM2 (Recommended)

```bash
# backend/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'alumni-connect-backend',
    script: './server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    instances: 'max',
    exec_mode: 'cluster'
  }]
};

pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
# backend/Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
```

```bash
docker build -t alumni-connect-backend .
docker run -p 8080:8080 \
  -e MONGODB_URI=your_uri \
  -e JWT_SECRET=your_secret \
  alumni-connect-backend
```

### Using Nginx Reverse Proxy

```nginx
upstream alumni_backend {
  server localhost:8080;
}

server {
  listen 80;
  server_name your-domain.com;

  location /api/ {
    proxy_pass http://alumni_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location /socket.io/ {
    proxy_pass http://alumni_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

## Support & Questions

For issues or questions:
1. Check browser DevTools console for errors
2. Check server logs for warnings
3. Check MongoDB collections for data
4. Verify WebSocket connection in DevTools Network tab
5. Review ONLINE_ALUMNI_FEATURE_DOCUMENTATION.md

---

**Happy Deploying! 🚀**
