# GPC Itarsi College Website

A comprehensive college management system built with React and Node.js, featuring responsive design, role-based access control, and a modern UI.

## Project Structure

### Frontend (React + Vite)

```
src/
├── assets/        # Static assets like images and icons
├── components/    # Reusable UI components
├── context/       # React context providers (AuthContext, etc.)
├── pages/         # Page components for different routes
│   ├── admin/     # Admin dashboard pages
│   ├── student/   # Student dashboard pages
│   ├── teacher/   # Teacher dashboard pages
│   └── ...        # Public pages (Home, About, etc.)
└── utils/         # Utility functions and helpers
```

### Backend (Node.js + Express)

```
backend/
├── data/          # JSON data files for storage (used instead of MongoDB)
├── middleware/    # Express middleware
├── models/        # Data models (reference only, not used with JSON storage)
├── routes/        # API route handlers
├── services/      # Business logic services
├── uploads/       # Uploaded files
│   ├── courses/   # Course images
│   ├── gallery/   # Gallery images
│   ├── notices/   # Notice attachments
│   ├── forms/     # Document uploads
│   └── profiles/  # User profile pictures
└── file-server.js # Main server file
```

> **Note:** This project uses JSON files for data storage instead of MongoDB for simplicity and portability.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```
   npm install
   ```
3. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

### Running the Application

#### Quick Start (Windows)

Simply double-click the `start-project.bat` file in the root directory to start both the backend and frontend servers in separate windows.

#### Manual Start

1. Start the backend server:
   ```
   cd backend
   node file-server.js
   ```
2. Start the frontend development server:
   ```
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:3000`

## Authentication

Use the following credentials to log in:

- **Admin**: username: "anmol", password: "2007" or username: "operator", password: "1234"
- **Teacher**: Use any teacher name as username with password "1234"
- **Student**: Use roll number as username with password "1234"

## Features

### Core Features
- User authentication and role-based access control
- Responsive design optimized for both desktop and mobile devices
- Modern UI with consistent styling across all sections
- Developer profile in footer with contact information

### Admin Features
- Comprehensive dashboard for managing students, teachers, courses, and notices
- Advanced attendance management with options to:
  - Reset all student attendance
  - Reset specific student attendance
  - Edit individual attendance records
  - View detailed student data in popup windows
- Customizable button icons for better visual representation
- System backup and restore functionality to download/upload all system data
- Document management system for forms, applications, and newsletters

### Teacher Features
- Mark student attendance with bulk selection options
- Upload and manage study materials for students
- View student performance and attendance statistics

### Student Features
- View personal attendance records with subject-wise and monthly breakdowns
- Access study materials uploaded by teachers
- View notices and important announcements

### Public Features
- Responsive home page with improved hero section and campus imagery
- Course catalog with detailed information
- Faculty directory with profiles
- Gallery with campus photos and events
- Downloads section for forms and documents

## Deployment

The website is currently deployed on Render:
- Frontend: https://gpc-itarsi-9cl7.onrender.com
- Backend: https://gpc-itarsi-backend-8dod.onrender.com

### Deployment on Render using Blueprint

This project includes a `render.yaml` file that allows for easy deployment using Render Blueprints.

1. Sign up for a Render account at https://render.com
2. Fork or push this repository to your GitHub account
3. In the Render dashboard, click on "New" and select "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file and create both the frontend and backend services
6. Click "Apply" to start the deployment

### Manual Deployment on Render

#### Frontend Deployment

1. Sign up for a Render account at https://render.com
2. Create a new **Static Site** service
3. Connect your GitHub repository
4. Configure the build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
5. Add the environment variable:
   - `VITE_API_URL`: URL of your deployed backend (https://gpc-itarsi-backend-8dod.onrender.com)

#### Backend Deployment

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Configure the build settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node file-server.js`
4. Add the environment variables:
   - `PORT`: Leave empty (Render will provide this)
   - `JWT_SECRET`: Your secret key for JWT tokens
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: URL of your deployed frontend (https://gpc-itarsi-9cl7.onrender.com)
   - `BACKEND_URL`: URL of your deployed backend (https://gpc-itarsi-backend-8dod.onrender.com)
5. Add disk storage:
   - Create two disk resources named "data" and "uploads" with 1GB each
   - Mount paths:
     - `/opt/render/project/src/data`
     - `/opt/render/project/src/uploads`

## Developer

This website was developed by Anmol Malviya. You can find more information about the developer by clicking the developer button in the footer of the website.
