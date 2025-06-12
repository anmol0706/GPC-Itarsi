# GPC Itarsi MongoDB Backend

This is the MongoDB Atlas backend for the GPC Itarsi College Website. It provides all the API endpoints needed by the frontend application.

## Features

- MongoDB Atlas database integration
- JWT authentication and authorization
- Role-based access control (Admin, Teacher, Student, Developer)
- File upload handling
- RESTful API endpoints for all college data

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (connection string is already configured)

## Installation

1. Clone the repository
2. Navigate to the mongodb-backend directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory with the following variables:

```
PORT=5001
JWT_SECRET=your-jwt-secret-key
MONGODB_URI=mongodb+srv://GPC:anmol4328@gpc-itarsi.puza0ta.mongodb.net/gpc-itarsi
FRONTEND_URL=https://gpc-itarsi-5coi.onrender.com
NODE_ENV=development
```

## Database Initialization

To initialize the database with default data (admin user, courses, etc.), run:

```bash
npm run init-db
```

This will create:
- Default admin user (username: admin, password: admin123)
- Default overview information
- Default courses
- Default chatbot FAQs

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## API Endpoints

The backend provides the following API endpoints:

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user (admin only)
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/profile-picture` - Update profile picture
- `DELETE /api/users/:id` - Delete user (admin only)

### Students
- `GET /api/students` - Get all students (admin and teacher access)
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/profile` - Get student profile
- `POST /api/students` - Add a new student (admin only)
- `PUT /api/students/:id` - Update student (admin only)
- `DELETE /api/students/:id` - Delete student (admin only)
- `POST /api/students/promote` - Promote students (admin only)

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `GET /api/teachers/profile` - Get teacher profile
- `POST /api/teachers` - Add a new teacher (admin only)
- `PUT /api/teachers/:id` - Update teacher (admin only)
- `DELETE /api/teachers/:id` - Delete teacher (admin only)

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Add a new course (admin only)
- `PUT /api/courses/:id` - Update course (admin only)
- `DELETE /api/courses/:id` - Delete course (admin only)

### Notices
- `GET /api/notices` - Get all notices
- `GET /api/notices/:id` - Get notice by ID
- `POST /api/notices` - Add a new notice (admin and teacher)
- `PUT /api/notices/:id` - Update notice (admin and original poster)
- `DELETE /api/notices/:id` - Delete notice (admin and original poster)

### Gallery
- `GET /api/gallery` - Get all gallery items
- `GET /api/gallery/:id` - Get gallery item by ID
- `POST /api/gallery` - Add a new gallery item (admin only)
- `PUT /api/gallery/:id` - Update gallery item (admin only)
- `DELETE /api/gallery/:id` - Delete gallery item (admin only)

### Study Materials
- `GET /api/study-materials` - Get all study materials (admin and teacher access)
- `GET /api/study-materials/all` - Get all study materials (public access)
- `GET /api/study-materials/class/:className` - Get study materials for a specific class
- `GET /api/study-materials/:id` - Get study material by ID
- `POST /api/study-materials/upload` - Upload study material (admin and teacher access)
- `PUT /api/study-materials/:id` - Update study material (admin and original uploader)
- `DELETE /api/study-materials/:id` - Delete study material (admin and original uploader)

### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/category/:category` - Get documents by category
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents` - Upload document (admin only)
- `PUT /api/documents/:id` - Update document (admin only)
- `DELETE /api/documents/:id` - Delete document (admin only)

### Overview
- `GET /api/overview` - Get overview data
- `PUT /api/overview` - Update overview (admin only)
- `GET /api/overview/principal-message` - Get principal's message
- `PUT /api/overview/principal-message` - Update principal's message (admin only)

### Chatbot
- `GET /api/chatbot/faqs` - Get all chatbot FAQs
- `GET /api/chatbot/faqs/:id` - Get chatbot FAQ by ID
- `POST /api/chatbot/faqs` - Add a new chatbot FAQ (admin only)
- `PUT /api/chatbot/faqs/:id` - Update chatbot FAQ (admin only)
- `DELETE /api/chatbot/faqs/:id` - Delete chatbot FAQ (admin only)
- `POST /api/chatbot/query` - Get chatbot response for a query

## Deployment

This backend can be deployed to any Node.js hosting service. For Render.com deployment, a `render.yaml` file is included in the repository.

## License

This project is licensed under the MIT License.
