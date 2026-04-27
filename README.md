# Findly - Lost & Found Web Application

A complete full-stack Lost & Found web application that helps users report and recover lost items. Built with React, Node.js, Express, MongoDB, and Socket.io for real-time chat functionality.

## Features

### Core Features
- **Authentication**: User registration and login system
- **Item Management**: Post, edit, and delete lost/found items
- **Search & Filters**: Advanced filtering by category, location, and type
- **Real-time Chat**: Socket.io powered messaging between users
- **Claim System**: Users can claim items and owners can accept/reject
- **Dashboard**: Real-time statistics and activity overview

### Additional Features
- **Favorites**: Save items for later viewing
- **Notifications**: Real-time updates for messages and claims
- **Profile Management**: User profile and settings
- **Responsive Design**: Mobile-friendly interface
- **Image Upload**: Support for item images

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.io Client** for real-time communication
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time chat
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

## Project Structure

```
findly/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── uploads/         # Image uploads directory
│   ├── .env           # Environment variables
│   ├── package.json
│   └── server.js      # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── contexts/   # React contexts
│   │   ├── pages/      # Page components
│   │   ├── App.jsx     # Main App component
│   │   └── main.jsx    # Entry point
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd findly

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/findly
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:
- For local MongoDB: `mongod`
- For MongoDB Atlas: Update the `MONGODB_URI` in your `.env` file

### 4. Start the Application

#### Backend Server
```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

#### Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### 5. Access the Application

Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - Get all items with filters
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/items/user/:userId` - Get user's items

### Claims
- `POST /api/claims/:itemId` - Create claim
- `PUT /api/claims/:itemId/:claimId` - Update claim status
- `GET /api/claims/user/:userId` - Get user's claims

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `GET /api/chat/item/:itemId` - Get chat for item
- `POST /api/chat/start/:itemId` - Start new chat

### Users
- `GET /api/users/dashboard` - Get dashboard stats
- `POST /api/users/favorites/:itemId` - Toggle favorite
- `GET /api/users/favorites` - Get user favorites
- `GET /api/users/notifications` - Get user notifications

## Socket.io Events

### Client to Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message

### Server to Client
- `receive_message` - Receive a new message

## Features in Detail

### Dashboard
- Real-time statistics showing:
  - Total items posted
  - Lost vs Found count
  - Claims received
  - Recovery rate
- Recent items and claims overview
- Quick action buttons

### Item Management
- Post lost or found items with:
  - Title and description
  - Category selection
  - Location and date
  - Image upload
- Edit and delete own items
- Status tracking (active, claimed, resolved)

### Real-time Chat
- One conversation per item + user pair
- Message bubbles with timestamps
- Auto-scroll to latest messages
- Online status indicators

### Claim System
- Users can claim items with a message
- Item owners receive notifications
- Accept/reject claims with status updates
- Automatic status management

### Search & Filtering
- Search by title and description
- Filter by type (lost/found)
- Filter by category
- Filter by location
- Real-time filter updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For any issues or questions, please create an issue in the repository.

---

**Happy Finding! 🚀**
