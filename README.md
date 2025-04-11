# RGPVI College Website

A comprehensive college management system built with React and Node.js.

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
├── services/      # Business logic services
├── uploads/       # Uploaded files
│   ├── courses/   # Course images
│   ├── gallery/   # Gallery images
│   ├── notices/   # Notice attachments
│   └── profiles/  # User profile pictures
└── file-server.js # Main server file
```

> **Note:** This project uses JSON files for data storage instead of MongoDB.

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
3. Open your browser and navigate to `http://localhost:5173`

## Authentication

Use the following credentials to log in:

- **Admin**: username: "anmol", password: "2007"
- **Teacher**: Use any teacher name as username with password "1234"
- **Student**: Use roll number as username with password "1234"

## Features

- User authentication and role-based access control
- Admin dashboard for managing students, teachers, courses, and notices
- Teacher dashboard for managing study materials and attendance
- Student dashboard for viewing attendance, study materials, and notices
- Public pages for college information, courses, and gallery
