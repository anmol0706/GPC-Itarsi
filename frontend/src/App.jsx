import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Context
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { CalendarProvider } from './context/CalendarContext'
// Grade feature has been removed

// SEO and Schema Components
import SchemaMarkup from './components/SchemaMarkup'
import { generateCollegeSchema } from './utils/schemaMarkup'

// Components that are used on every page - load eagerly
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy load all pages for better code splitting
// Public Pages
const Home = lazy(() => import('./pages/Home'))
const Courses = lazy(() => import('./pages/Courses'))
const Faculty = lazy(() => import('./pages/Faculty'))
const Gallery = lazy(() => import('./pages/Gallery'))
const About = lazy(() => import('./pages/About'))
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
// ResetPassword page is no longer needed as we're using OTP-based reset
const Downloads = lazy(() => import('./pages/Downloads'))
const Admission = lazy(() => import('./pages/Admission'))

// Private Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'))
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'))
// Developer Dashboard is now in a separate application

// Shared Pages
const NotificationsPage = lazy(() => import('./pages/shared/NotificationsPage'))
const CalendarPage = lazy(() => import('./pages/shared/CalendarPage'))

// Lazy load non-critical components
const ChatbotWidget = lazy(() => import('./components/ChatbotWidget'))

function App() {
  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-2">Loading...</p>
    </div>
  );

  // Generate college schema for the entire site
  const collegeSchema = generateCollegeSchema();

  return (
    <AuthProvider>
      <NotificationProvider>
        <CalendarProvider>
          <Router future={{ v7_relativeSplatPath: true }}>
            {/* Add schema.org structured data */}
            <SchemaMarkup schema={collegeSchema} id="college-schema" />

            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/faculty" element={<Faculty />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/downloads" element={<Downloads />} />
                    <Route path="/admission" element={<Admission />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Admin route - no authentication required */}
                    <Route path="/admin/*" element={<AdminDashboard />} />

                    <Route path="/teacher/*" element={
                      <ProtectedRoute allowedRoles={['teacher']}>
                        <TeacherDashboard />
                      </ProtectedRoute>
                    } />

                    <Route path="/student/*" element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    } />

                    {/* Developer routes are now handled by a separate application */}
                    <Route path="/developer/*" element={
                      <Navigate to="http://localhost:5175" replace />
                    } />

                    {/* Shared Protected Routes */}
                    <Route path="/notifications" element={
                      <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'developer']}>
                        <NotificationsPage />
                      </ProtectedRoute>
                    } />

                    <Route path="/calendar" element={
                      <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'developer']}>
                        <CalendarPage />
                      </ProtectedRoute>
                    } />

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <Suspense fallback={null}>
                <ChatbotWidget />
              </Suspense>
            </div>
          </Router>
        </CalendarProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
