# 🛡️ Women Safety Alert Tracking System

A comprehensive MERN stack application for women's safety with real-time SOS alerts, guardian notifications, and live location tracking.

## ✨ Features

### Core Features
- 🚨 **Emergency SOS Alerts** - One-click emergency alert with location
- 📍 **Live Location Tracking** - Real-time GPS tracking for active alerts
- 👥 **Guardian Management** - Add and manage trusted contacts
- 📬 **Alert History** - View all past and active alerts
- 🔐 **Admin Dashboard** - Comprehensive admin panel for monitoring

### Real-Time Features
- ⚡ **WebSocket Integration** - Real-time updates using Socket.io
- 🔔 **Multi-Channel Notifications** - Email, SMS, and WhatsApp alerts
- 📊 **Alert Timeline** - Complete audit trail (created, notified, resolved)

### Security
- 🔒 **JWT Authentication** - Secure token-based authentication
- 🛡️ **Role-Based Access Control** - User, Guardian, and Admin roles
- 🔐 **Protected Routes** - Secure API endpoints

## 🛠️ Tech Stack

### Frontend
- React.js 19
- React Router DOM
- Socket.io Client
- Axios
- Modern CSS with animations

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io
- JWT Authentication
- Nodemailer (Email)
- Twilio (SMS/WhatsApp)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Twilio Account (for SMS/WhatsApp)
- Email Account (for email notifications)

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/women-safety-system.git
cd women-safety-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
# Server
PORT=5000

# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Email (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE=+1234567890
ENABLE_WHATSAPP=false
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Frontend URL (for CORS and Socket.io)
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional):
```env
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Run the Application

**Backend:**
```bash
cd backend
npm start
# or for development
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📱 Usage

### For Users
1. **Register/Login** - Create an account or login
2. **Add Guardians** - Add trusted contacts who will receive alerts
3. **Send SOS** - Click the SOS button in emergency situations
4. **View Alerts** - Check your alert history

### For Guardians
1. **Login** - Use your account credentials
2. **View Alerts** - See alerts from users you're guardian for
3. **Track Location** - View real-time location of active alerts
4. **Resolve Alerts** - Mark alerts as resolved when safe

### For Admins
1. **Admin Dashboard** - View all alerts in the system
2. **Monitor Activity** - Track all SOS alerts and resolutions
3. **Resolve Alerts** - Mark any alert as resolved

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Alerts
- `GET /api/alerts/my-alerts` - Get user's alerts
- `GET /api/alerts/guardian-alerts` - Get guardian alerts
- `GET /api/alerts/all-alerts` - Get all alerts (admin)
- `PUT /api/alerts/resolve/:alertId` - Resolve an alert
- `GET /api/alerts/live-location/:alertId` - Get live location

### SOS
- `POST /api/sos/send` - Send SOS alert

### Users
- `GET /api/users/profile` - Get user profile
- `GET /api/users/guardians` - Get user's guardians
- `GET /api/users/search` - Search users
- `POST /api/users/guardians` - Add guardian
- `DELETE /api/users/guardians/:guardianId` - Remove guardian

## 🔐 Environment Variables

See the `.env` examples above. Make sure to:
- Never commit `.env` files to version control
- Use strong JWT secrets in production
- Configure Twilio credentials for SMS/WhatsApp
- Set up email service for notifications

## 📝 Project Structure

```
women-safety-system/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Utilities (notifications, tokens)
│   └── server.js        # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── routes/      # Route configuration
│   │   └── utils/       # Utilities (API, socket)
│   └── public/          # Static files
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - [GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- React.js community
- Express.js documentation
- Socket.io for real-time features
- Twilio for SMS/WhatsApp integration

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

---

**⚠️ Important:** This is a safety application. Ensure all notifications are properly configured before deploying to production.

