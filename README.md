# 🌟 Soul Hospitality - Complete E-Commerce Management System

Soul Hospitality is a comprehensive hotel and service management platform built with **Node.js**, **Express**, and **React**. It features a robust API with JWT authentication, secure file uploads (Cloudinary), and a feature-rich admin dashboard for managing hotels, room types, bookings, and customer interactions.

## 📋 Table of Contents

- [Features](#features)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Admin Dashboard](#admin-dashboard)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 🚀 Features

### Core Features
- **Authentication & Authorization**: Secure JWT-based login and role-based access control (Admin, User, Manager, Supervisor, Service Provider)
- **Multi-Tenancy**: Multi-hotel management with support for multiple branches
- **Cloudinary Integration**: Secure file uploads for hotel images, menus, and user profiles
- **Real-time Updates**: Socket.io notifications for connected sales dashboards
- **File Uploads**: Multer-powered file uploads with strict validation

### Hotel Management
- **Hotel CRUD**: Create, read, update, and delete hotel information
- **Room Types**: Manage different room types with pricing and availability
- **Service Providers**: Manage external service providers (catering, cleaning, entertainment)
- **Facilities**: Track hotel facilities and amenities

### Booking Management
- **Booking Creation**: Customer bookings with date management
- **Booking Tracking**: Real-time status updates (Confirmed, Cancelled, Completed)
- **Reservation Management**: Manage hotel reservations
- **Billing**: Integrated billing and payment tracking

### Customer Management
- **Customer Profiles**: Complete customer information management
- **Customer Feedback**: Collect and manage customer reviews and ratings
- **Service Requests**: Track customer service requests and issues

### Admin Dashboard
- **Role Management**: Create and manage user roles
- **Dashboard Analytics**: Real-time statistics and visualizations
- **Media Management**: Manage uploaded images and files
- **System Logs**: View audit trails and system events

### Service & Request Features
- **Service Catalogue**: Manage available services (laundry, room service, maintenance)
- **Request Tracking**: Track service requests from check-in to completion
- **Maintenance Management**: Manage maintenance requests and history

---

## 📂 Folder Structure

```
soul-hospitality/
├── client/                # React frontend application
├── server/                # Node.js backend API
│   ├── config/            # Configuration files
│   │   ├── cloudinary.js  # Cloudinary integration
│   │   ├── db.js          # Database connection
│   │   └── upload.js      # File upload configuration
│   ├── controllers/       # Request handlers
│   │   ├── authController.js
│   │   ├── hotelController.js
│   │   ├── bookingController.js
│   │   ├── customerController.js
│   │   ├── roomTypeController.js
│   │   ├── serviceController.js
│   │   ├── reservationController.js
│   │   ├── serviceProviderController.js
│   │   ├── menuController.js
│   │   ├── galleryController.js
│   │   ├── feedbackController.js
│   │   ├── roleController.js
│   │   ├── facilityController.js
│   │   ├── maintenanceController.js
│   │   ├── serviceRequestController.js
│   │   ├── dashboardController.js
│   │   └── uploadController.js
│   ├── middleware/        # Custom middleware
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── validation.js
│   ├── models/            # Database schemas
│   │   ├── User.js
│   │   ├── Hotel.js
│   │   ├── RoomType.js
│   │   ├── Booking.js
│   │   ├── Customer.js
│   │   ├── Service.js
│   │   ├── ServiceProvider.js
│   │   ├── Menu.js
│   │   ├── Gallery.js
│   │   ├── Feedback.js
│   │   ├── Role.js
│   │   ├── Facility.js
│   │   ├── Maintenance.js
│   │   ├── ServiceRequest.js
│   │   └── Reservation.js
│   ├── routes/            # API route definitions
│   │   ├── auth.js
│   │   ├── hotels.js
│   │   ├── bookings.js
│   │   ├── customers.js
│   │   ├── roomTypes.js
│   │   ├── services.js
│   │   ├── serviceProviders.js
│   │   ├── menus.js
│   │   ├── galleries.js
│   │   ├── feedbacks.js
│   │   ├── roles.js
│   │   ├── facilities.js
│   │   ├── maintenance.js
│   │   ├── serviceRequests.js
│   │   ├── dashboard.js
│   │   └── upload.js
│   ├── server.js           # Application entry point
│   └── utils/            # Utility functions
│       └── uploadHelper.js
├── screenshots/          # Application screenshots
├── package.json            # Root package file
└── README.md               # Project documentation
```

---

##  prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **MongoDB** (local or cloud-based like MongoDB Atlas)
- **Cloudinary Account** (free tier available)

### Required Accounts

- [MongoDB Account](https://www.mongodb.com/cloud/atlas/register) (for database)
- [Cloudinary Account](https://cloudinary.com/users/register/new) (for file storage)

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd soul-hospitality
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

---

## ⚙️ Configuration

### 1. Database Configuration

Update the MongoDB connection string in `server/config/db.js` or set the `MONGODB_URI` environment variable.

### 2. Cloudinary Configuration

Create a `.env` file in the `server` directory and add your Cloudinary credentials:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Other Environment Variables

Create a `.env` file in the `server` directory with the following:

```bash
PORT=3000
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
MONGODB_URI=your_mongodb_uri
```

---

## ▶️ Running the Application

### Start Server

```bash
cd server
npm run dev
```

### Start Client

Open a new terminal:

```bash
cd client
npm run dev
```

The application will be accessible at:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`

### Production Build

```bash
# Build the frontend
cd client
npm run build

# Start server in production mode
cd server
npm start
```

---

## 📋 Environment Variables