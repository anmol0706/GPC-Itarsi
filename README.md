# Government Polytechnic College, Itarsi Website

A comprehensive college management system built with React and Node.js for Government Polytechnic College, Itarsi (GPC Itarsi). This project provides a complete solution for managing college operations, including student attendance, course materials, faculty information, and administrative tasks.

## Live Demo

The application is deployed and accessible at:
- Frontend: [https://gpc-itarsi.onrender.com](https://gpc-itarsi.onrender.com)
- Backend API: [https://gpc-itarsi-backend.onrender.com](https://gpc-itarsi-backend.onrender.com)

## Project Structure

### Frontend (React + Vite)

```
src/
├── assets/        # Static assets like images and icons
├── components/    # Reusable UI components
├── config/        # Configuration files (API endpoints, etc.)
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

### Public Directory

```
public/
├── images/        # Static images used throughout the site
│   └── college-logo.png  # College logo used as favicon and branding
├── team/          # Developer team member images
├── robots.txt     # Instructions for search engine crawlers
├── sitemap.xml    # XML sitemap for search engines
└── .htaccess      # Apache server configuration for SPA routing
```

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

## Building for Production

To build the application for production deployment:

1. Run the build script:
   ```
   npm run build
   ```
   or use the provided batch file:
   ```
   build.bat
   ```

2. The build output will be in the `dist` directory, ready for deployment to Render or other hosting services.

## Authentication

Use the following credentials to log in:

- **Admin**: username: "anmol", password: "2007"
- **Teacher**: Use any teacher name as username with password "1234"
- **Student**: Use roll number as username with password "1234"

## Features

### Core Features
- User authentication and role-based access control
- Responsive design for all device sizes
- SEO optimization with meta tags, sitemap, and robots.txt

### Admin Dashboard
- Manage students organized by branch (CS, ME, EE, EC) and year (1st, 2nd, 3rd)
- Manage teachers and faculty information
- Add/edit courses and study materials
- Post announcements and notices
- Upload gallery images
- Create custom navigation buttons for the home page
- Reset attendance for individual students or all students

### Teacher Dashboard
- Manage study materials and course content
- Track and update student attendance
- View student information

### Student Dashboard
- View attendance records
- Access study materials and notices
- View course information

### Public Pages
- Home page with key information, facilities, and custom navigation buttons
- About page with college history and mission
- Courses page with detailed information
- Faculty directory
- Gallery with campus and event photos
- Downloads section for important documents
- Admission information

## Developers

This project was developed by a team of 5 students. The team information can be accessed through the 'Developers' button in the website footer, which opens a popup displaying:

- Developer profile images
- Names
- Contact emails
- Social media links (Instagram, GitHub, Portfolio)

Developer images are stored in the `public/team/` directory.

## SEO Optimization

The website is optimized for search engines with:

- Meta tags for title, description, and keywords
- Open Graph and Twitter card meta tags for social media sharing
- XML sitemap at `/sitemap.xml`
- Robots.txt file with sitemap reference
- Canonical URLs
- Semantic HTML structure
- Structured data for rich search results

## Deployment

The application is deployed on Render:

1. Frontend: [https://gpc-itarsi.onrender.com](https://gpc-itarsi.onrender.com)
2. Backend API: [https://gpc-itarsi-backend.onrender.com](https://gpc-itarsi-backend.onrender.com)

The deployment configuration is defined in `render.yaml` and the build process is automated using the `build.bat` script.

## License

This project is proprietary and developed specifically for Government Polytechnic College, Itarsi.
