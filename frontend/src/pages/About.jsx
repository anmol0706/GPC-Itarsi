import { useState, useEffect } from 'react';
import axios from 'axios';
import { TextReveal } from '../components/animations';
import './about.css';
import config from '../config';
import { getProfileImageUrl, handleImageError } from '../utils/imageUtils';
import CourseDetailsModal from '../components/CourseDetailsModal';
import { getDepartmentImageUrl } from '../utils/departmentImageUtils';

// Import SEO components
import SEO from '../components/SEO';
import SchemaMarkup from '../components/SchemaMarkup';
import { generateCollegeSchema, generateBreadcrumbSchema } from '../utils/schemaMarkup';

const About = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [principalMessage, setPrincipalMessage] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hodData, setHodData] = useState([]);

  // Generate breadcrumb schema for the about page
  const breadcrumbSchema = generateBreadcrumbSchema([
    {
      name: 'Home',
      url: 'https://gpc-itarsi-9cl7.onrender.com/'
    },
    {
      name: 'About',
      url: 'https://gpc-itarsi-9cl7.onrender.com/about'
    }
  ]);

  // Generate college schema with additional information
  const collegeSchema = generateCollegeSchema({
    description: 'Government Polytechnic College Itarsi (GPC Itarsi) is a premier technical institution offering diploma courses in engineering and technology. Learn about our mission, vision, faculty, and facilities.'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch overview, principal message, HOD data, and contact info data in parallel
        try {
          const [overviewResponse, principalResponse, contactResponse, hodResponse] = await Promise.all([
            axios.get(`${config.apiUrl}/api/overview`).catch(() => ({ data: null })),
            axios.get(`${config.apiUrl}/api/overview/principal-message`).catch(() => ({ data: null })),
            axios.get(`${config.apiUrl}/api/contact-info`).catch(() => ({ data: null })),
            axios.get(`${config.apiUrl}/api/hod`).catch(() => ({ data: [] }))
          ]);

          if (overviewResponse.data) {
            setOverviewData(overviewResponse.data);
          }

          if (principalResponse.data) {
            setPrincipalMessage(principalResponse.data);
          }

          if (contactResponse.data) {
            setContactInfo(contactResponse.data);
          }

          if (hodResponse.data) {
            setHodData(hodResponse.data);
          }
        } catch (apiError) {
          console.error('API error:', apiError);
          // Continue with default values if API fails
        }

        // Always set loading to false, even if API calls fail
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchData:', err);
        // Don't set error, just finish loading with default values
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to handle opening the department details modal
  const handleOpenDepartmentModal = (department) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  // Function to handle closing the department details modal
  const handleCloseDepartmentModal = () => {
    setIsModalOpen(false);
    // Reset the selected department after a short delay to allow for closing animation
    setTimeout(() => {
      setSelectedDepartment(null);
    }, 300);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // We'll continue even if there's an error, so this block is no longer needed
  // The page will display with default values

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* SEO Optimization */}
      <SEO
        title="About Government Polytechnic College Itarsi"
        description="Learn about Government Polytechnic College Itarsi (GPC Itarsi), our mission, vision, faculty, and facilities. A premier technical institution offering diploma courses in engineering and technology."
        keywords="Government Polytechnic College Itarsi, GPC Itarsi, GPCI, Polytechnic College Itarsi, about GPC, about GPCI, technical education, diploma courses, engineering college Itarsi"
        ogImage="/images/campus.jpg"
      />

      {/* Schema.org Markup */}
      <SchemaMarkup schema={breadcrumbSchema} id="breadcrumb-schema" />
      <SchemaMarkup schema={collegeSchema} id="college-schema" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-primary-600 to-primary-800 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            transform: 'rotate(45deg)'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
          <div className="animate-float inline-block mb-6 p-2 bg-white/10 rounded-full backdrop-blur-sm shadow-xl">
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-8 h-8 text-accent-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
              </svg>
            </div>
          </div>

          <TextReveal className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            <span>About <span className="text-accent-400 relative inline-block">GPC Itarsi
              <span className="absolute bottom-0 left-0 w-full h-1 bg-accent-400 rounded-full transform -translate-y-2"></span>
            </span></span>
          </TextReveal>

          <TextReveal className="mt-8 max-w-lg mx-auto text-xl text-primary-100 sm:max-w-3xl" delay={0.5}>
            Empowering students with quality technical education since 1960
          </TextReveal>

          <div className="mt-10 flex justify-center space-x-6">
            <a href="#overview" className="animate-bounce-slow inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-primary-800 bg-white hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg">
              <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Explore
            </a>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white">
          <svg className="absolute -top-16 w-full h-16 text-white" preserveAspectRatio="none" viewBox="0 0 1440 54">
            <path fill="currentColor" d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"></path>
          </svg>
        </div>
      </div>

      {/* College Overview Section */}
      <div id="overview" className="py-20 bg-white section-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase inline-block highlight-text">Our Institution</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Government Polytechnic College, Itarsi
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              A premier institution offering quality technical education since 2011, fostering academic excellence and creating industry-ready professionals.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="prose prose-lg text-gray-500">
                <p className="leading-relaxed">
                  {overviewData?.content || "Government Polytechnic College, Itarsi (GPC Itarsi) is a premier technical institution located in Itarsi, Madhya Pradesh. Established in 2011, the college has been at the forefront of technical education in the region. The college is affiliated with Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV) and is approved by the All India Council for Technical Education (AICTE)."}
                </p>
                <p className="mt-4 leading-relaxed">
                  The college offers diploma programs in four major branches: Computer Science (CS), Mechanical Engineering (ME),
                  Electronics & Telecommunication (ET), and Electrical Engineering (EE). With state-of-the-art laboratories,
                  experienced faculty, and modern infrastructure, GPC Itarsi provides an ideal environment for students to excel in their technical education.
                </p>
                <p className="mt-4 leading-relaxed">
                  Over the years, GPC Itarsi has established itself as a center of excellence in technical education, producing thousands of skilled
                  professionals who have made significant contributions to various industries across India and abroad.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary-100 rounded-full z-0"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent-100 rounded-full z-0"></div>
                <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl border-4 border-white image-hover">
                  <img
                    src="/images/campus.jpg"
                    alt="GPC Itarsi Campus"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/fallback-campus.jpg';
                    }}
                  />
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
                  <p className="text-primary-800 font-bold text-lg">Established 2011</p>
                </div>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-primary-50 p-6 rounded-lg shadow-md hover-card">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Modern Infrastructure</h3>
                </div>
                <p className="text-gray-600">State-of-the-art laboratories, classrooms, workshops, and library facilities to support comprehensive learning.</p>
              </div>

              <div className="bg-primary-50 p-6 rounded-lg shadow-md hover-card">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Experienced Faculty</h3>
                </div>
                <p className="text-gray-600">Highly qualified and dedicated faculty members with extensive academic and industry experience.</p>
              </div>

              <div className="bg-primary-50 p-6 rounded-lg shadow-md hover-card">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Industry Connections</h3>
                </div>
                <p className="text-gray-600">Strong ties with industry partners providing internships, placements, and practical exposure to students.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission and Vision Section */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase inline-block highlight-text">Our Purpose</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl gradient-text">
              Mission & Vision
            </p>
            <div className="h-1 w-20 bg-accent-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div className="bg-white overflow-hidden shadow-lg rounded-xl hover-card border border-primary-100">
                <div className="relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-primary-500"></div>
                  <div className="px-6 py-8">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-500 rounded-full p-3 shadow-md">
                        <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="ml-4 text-xl leading-6 font-bold text-gray-900">Our Mission</h3>
                    </div>
                    <div className="mt-6 text-gray-600">
                      <p className="text-lg">
                        {overviewData?.mission || "To provide quality technical education that prepares students for leadership and service in a diverse and global society. We aim to:"}
                      </p>
                      <ul className="list-none pl-0 mt-4 space-y-3">
                        {[
                          'Impart high-quality technical education that meets industry standards',
                          'Foster innovation, creativity, and entrepreneurship among students',
                          'Develop skilled professionals with strong ethical values',
                          'Promote research and development in emerging technologies',
                          'Contribute to the socio-economic development of the region and the country'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="h-6 w-6 text-primary-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-xl hover-card border border-accent-100">
                <div className="relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-accent-500"></div>
                  <div className="px-6 py-8">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-accent-500 rounded-full p-3 shadow-md">
                        <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <h3 className="ml-4 text-xl leading-6 font-bold text-gray-900">Our Vision</h3>
                    </div>
                    <div className="mt-6 text-gray-600">
                      <p className="text-lg">
                        {overviewData?.vision || "To be recognized as a premier institution of technical education, known for its academic excellence, innovative teaching methods, and commitment to producing industry-ready professionals. We envision:"}
                      </p>
                      <ul className="list-none pl-0 mt-4 space-y-3">
                        {[
                          'Becoming a center of excellence in technical education',
                          'Establishing strong industry-academia partnerships',
                          'Creating a vibrant ecosystem for innovation and entrepreneurship',
                          'Achieving 100% placement for eligible students',
                          'Contributing to sustainable development through technical solutions'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="h-6 w-6 text-accent-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Statistics Section */}
      <div className="py-20 bg-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(135deg, #4f46e5 10%, transparent 0, transparent 50%, #4f46e5 0, #4f46e5 60%, transparent 0, transparent)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase inline-block highlight-text">Our Achievements</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Key Statistics
            </p>
            <div className="h-1 w-20 bg-primary-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div className="bg-gradient-to-br from-primary-50 to-white overflow-hidden shadow-lg rounded-xl stat-card border border-primary-100">
                <div className="px-4 py-8 sm:p-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100">
                    <svg className="w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">{overviewData?.stats?.[0]?.label || "Students"}</dt>
                  <dd className="mt-2 text-4xl font-extrabold text-primary-600 counter-number">{overviewData?.stats?.[0]?.value || "1000+"}</dd>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-white overflow-hidden shadow-lg rounded-xl stat-card border border-primary-100">
                <div className="px-4 py-8 sm:p-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100">
                    <svg className="w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">{overviewData?.stats?.[1]?.label || "Faculty"}</dt>
                  <dd className="mt-2 text-4xl font-extrabold text-primary-600 counter-number">{overviewData?.stats?.[1]?.value || "50+"}</dd>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-white overflow-hidden shadow-lg rounded-xl stat-card border border-primary-100">
                <div className="px-4 py-8 sm:p-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100">
                    <svg className="w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">{overviewData?.stats?.[2]?.label || "Courses"}</dt>
                  <dd className="mt-2 text-4xl font-extrabold text-primary-600 counter-number">{overviewData?.stats?.[2]?.value || "4"}</dd>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-white overflow-hidden shadow-lg rounded-xl stat-card border border-primary-100">
                <div className="px-4 py-8 sm:p-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100">
                    <svg className="w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">{overviewData?.stats?.[3]?.label || "Years of Excellence"}</dt>
                  <dd className="mt-2 text-4xl font-extrabold text-primary-600 counter-number">{overviewData?.stats?.[3]?.value || "12+"}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Principal's Message Section */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase inline-block highlight-text">Leadership</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Principal's Message
            </p>
            <div className="h-1 w-20 bg-accent-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="mt-10">
            <div className="bg-white shadow-xl overflow-hidden sm:rounded-xl border border-gray-100 hover-card">
              <div className="relative">
                <div className="absolute top-0 right-0 h-full w-1/3 bg-primary-50 z-0 hidden lg:block"></div>
                <div className="px-6 py-10 sm:px-10 sm:py-16 flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
                  <div className="flex-shrink-0 relative">
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary-100 rounded-full opacity-50 z-0"></div>
                    <div className="h-56 w-56 rounded-full overflow-hidden bg-white border-4 border-primary-100 shadow-xl relative z-10 image-hover">
                      <img
                        src={principalMessage?.image ? getProfileImageUrl(principalMessage.image) : "/images/principal-placeholder.svg"}
                        alt={principalMessage?.name || overviewData?.principalName || "Principal, GPC Itarsi"}
                        className="h-full w-full object-cover"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-accent-100 rounded-full opacity-70 z-0"></div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-block bg-primary-50 px-4 py-1 rounded-full mb-4">
                      <p className="text-primary-700 font-medium text-sm">From the Principal's Desk</p>
                    </div>
                    <h3 className="text-2xl leading-6 font-bold text-gray-900">{principalMessage?.name || overviewData?.principalName || "Dr. Rajesh Kumar"}</h3>
                    <p className="mt-2 max-w-2xl text-md text-primary-600 font-medium">{principalMessage?.title || overviewData?.principalDesignation || "Principal, Government Polytechnic College, Itarsi"}</p>
                    <div className="mt-6 text-gray-600 prose prose-lg">
                      <div className="relative">
                        <svg className="absolute -top-6 -left-8 h-16 w-16 text-primary-100 transform -rotate-12" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                        <div className="relative z-10">
                          {principalMessage?.message ? (
                            <>
                              {principalMessage.message.split('\n').map((paragraph, index) => (
                                <p key={index} className={index > 0 ? "mt-4" : ""}>{paragraph}</p>
                              ))}
                            </>
                          ) : overviewData?.principalMessage ? (
                            <>
                              {overviewData.principalMessage.split('\n').map((paragraph, index) => (
                                <p key={index} className={index > 0 ? "mt-4" : ""}>{paragraph}</p>
                              ))}
                            </>
                          ) : (
                            <>
                              <p>Welcome to Government Polytechnic College, Itarsi. For over six decades, our institution has been committed to providing quality technical education to students from all walks of life. Our mission is to nurture technically skilled professionals who can contribute meaningfully to the nation's development.</p>
                              <p className="mt-4">At GPC Itarsi, we believe in holistic development. Our curriculum is designed to impart not just technical knowledge but also essential life skills, ethical values, and a spirit of innovation. Our state-of-the-art infrastructure, experienced faculty, and strong industry connections ensure that our students receive the best possible education and training.</p>
                              <p className="mt-4">I invite you to explore our institution and discover the numerous opportunities we offer for academic and personal growth. Join us in our journey towards excellence in technical education.</p>
                            </>
                          )}
                        </div>
                        <div className="mt-6 flex items-center">
                          <div className="h-0.5 w-16 bg-primary-500 mr-4"></div>
                          <p className="text-primary-700 font-bold">{principalMessage?.name || overviewData?.principalName || "Dr. Rajesh Kumar"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOD Section */}
      <div className="py-20 bg-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(135deg, #4f46e5 10%, transparent 0, transparent 50%, #4f46e5 0, #4f46e5 60%, transparent 0, transparent)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase inline-block highlight-text">Department Leadership</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Heads of Departments
            </p>
            <div className="h-1 w-20 bg-accent-500 mx-auto mt-4 rounded-full"></div>
            <p className="mt-6 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Meet our dedicated Heads of Departments who lead our academic programs
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hodData && hodData.length > 0 ? (
                hodData.map((hod) => (
                  <div key={hod._id} className="bg-white shadow-xl overflow-hidden rounded-xl border border-gray-100 hover-card">
                    <div className="relative">
                      <div className="px-6 py-8 flex flex-col items-center">
                        <div className="relative mb-6">
                          <div className="absolute -top-3 -left-3 w-16 h-16 bg-primary-100 rounded-full opacity-50 z-0"></div>
                          <div className="h-40 w-40 rounded-full overflow-hidden bg-white border-4 border-primary-100 shadow-xl relative z-10 image-hover">
                            <img
                              src={hod.profilePicture ? getProfileImageUrl(hod.profilePicture) : "/images/faculty-placeholder.svg"}
                              alt={hod.name}
                              className="h-full w-full object-cover"
                              onError={handleImageError}
                            />
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-accent-100 rounded-full opacity-70 z-0"></div>
                        </div>
                        <div className="text-center">
                          <div className="inline-block bg-primary-50 px-4 py-1 rounded-full mb-3">
                            <p className="text-primary-700 font-medium text-sm">{hod.department}</p>
                          </div>
                          <h3 className="text-xl leading-6 font-bold text-gray-900">{hod.name}</h3>
                          <p className="mt-2 text-md text-primary-600 font-medium">{hod.designation || `Head of Department, ${hod.department}`}</p>
                          <p className="mt-1 text-sm text-gray-500">{hod.qualification}</p>
                          <p className="mt-1 text-sm text-gray-500">{hod.experience} Experience</p>

                          <div className="mt-6 text-gray-600 prose">
                            <div className="relative">
                              <div className="relative z-10">
                                {hod.message ? (
                                  <p className="text-sm italic">{hod.message}</p>
                                ) : (
                                  <p className="text-sm italic">Leading the {hod.department} department with a focus on academic excellence and innovation in teaching and research.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback HOD data if API fails or returns empty
                [
                  {
                    id: 'fallback1',
                    name: 'Dr. Amit Sharma',
                    department: 'Computer Science',
                    designation: 'Head of Department, Computer Science',
                    qualification: 'Ph.D. in Computer Science',
                    experience: '12 years',
                    message: 'Welcome to the Computer Science department at GPC Itarsi. Our department is committed to providing quality education in the field of computer science and information technology.'
                  },
                  {
                    id: 'fallback2',
                    name: 'Dr. Rajesh Verma',
                    department: 'Mechanical Engineering',
                    designation: 'Head of Department, Mechanical Engineering',
                    qualification: 'Ph.D. in Mechanical Engineering',
                    experience: '15 years',
                    message: 'The Mechanical Engineering department strives for excellence in teaching and research, preparing students for successful careers in the industry.'
                  },
                  {
                    id: 'fallback3',
                    name: 'Dr. Sunita Patel',
                    department: 'Electronics & Telecommunication',
                    designation: 'Head of Department, Electronics & Telecommunication',
                    qualification: 'Ph.D. in Electronics Engineering',
                    experience: '10 years',
                    message: 'Our department focuses on providing hands-on experience with the latest technologies in electronics and telecommunication engineering.'
                  }
                ].map((hod) => (
                  <div key={hod.id} className="bg-white shadow-xl overflow-hidden rounded-xl border border-gray-100 hover-card">
                    <div className="relative">
                      <div className="px-6 py-8 flex flex-col items-center">
                        <div className="relative mb-6">
                          <div className="absolute -top-3 -left-3 w-16 h-16 bg-primary-100 rounded-full opacity-50 z-0"></div>
                          <div className="h-40 w-40 rounded-full overflow-hidden bg-white border-4 border-primary-100 shadow-xl relative z-10 image-hover">
                            <img
                              src="/images/faculty-placeholder.svg"
                              alt={hod.name}
                              className="h-full w-full object-cover"
                              onError={handleImageError}
                            />
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-accent-100 rounded-full opacity-70 z-0"></div>
                        </div>
                        <div className="text-center">
                          <div className="inline-block bg-primary-50 px-4 py-1 rounded-full mb-3">
                            <p className="text-primary-700 font-medium text-sm">{hod.department}</p>
                          </div>
                          <h3 className="text-xl leading-6 font-bold text-gray-900">{hod.name}</h3>
                          <p className="mt-2 text-md text-primary-600 font-medium">{hod.designation}</p>
                          <p className="mt-1 text-sm text-gray-500">{hod.qualification}</p>
                          <p className="mt-1 text-sm text-gray-500">{hod.experience} Experience</p>

                          <div className="mt-6 text-gray-600 prose">
                            <div className="relative">
                              <div className="relative z-10">
                                <p className="text-sm italic">{hod.message}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Departments/Branches Section */}
      <div className="py-20 bg-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase inline-block highlight-text">Academic Programs</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Our Departments
            </p>
            <div className="h-1 w-20 bg-primary-500 mx-auto mt-4 rounded-full"></div>
            <p className="mt-6 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              GPC Itarsi offers diploma programs in four major engineering disciplines
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {/* Computer Science */}
              <div
                className="bg-white overflow-hidden shadow-lg rounded-xl department-card border border-blue-100 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => handleOpenDepartmentModal({
                  name: 'Computer Science',
                  icon: <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>,
                  description: "The Computer Science department offers a comprehensive diploma program covering programming, database management, networking, and software development.",
                  subjects: [
                    'Programming & Data Structures',
                    'Database Management Systems',
                    'Computer Networks',
                    'Web & Mobile Application Development',
                    'Artificial Intelligence & Machine Learning'
                  ]
                })}
              >
                {/* Department Image */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={getDepartmentImageUrl('Computer Science')}
                    alt="Computer Science Department"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getDepartmentImageUrl('fallback');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute top-0 left-0 right-0">
                    <div className="h-3 bg-blue-500 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse opacity-75"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full p-2 shadow-md">
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="ml-2 text-lg leading-6 font-bold text-white">Computer Science</h3>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-gray-600">
                    <p className="text-sm">
                      The Computer Science department offers a comprehensive diploma program covering programming, database management, networking, and software development.
                    </p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Code: CS
                    </span>
                    <span className="text-blue-600 text-sm font-medium flex items-center">
                      View Details
                      <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Mechanical Engineering */}
              <div
                className="bg-white overflow-hidden shadow-lg rounded-xl department-card border border-yellow-100 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => handleOpenDepartmentModal({
                  name: 'Mechanical Engineering',
                  icon: <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>,
                  description: "The Mechanical Engineering department focuses on design, manufacturing, and maintenance of mechanical systems and equipment.",
                  subjects: [
                    'Engineering Mechanics & Strength of Materials',
                    'Thermodynamics & Heat Transfer',
                    'Manufacturing Processes',
                    'Machine Design',
                    'Industrial Engineering & Management'
                  ]
                })}
              >
                {/* Department Image */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={getDepartmentImageUrl('Mechanical Engineering')}
                    alt="Mechanical Engineering Department"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getDepartmentImageUrl('fallback');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute top-0 left-0 right-0">
                    <div className="h-3 bg-yellow-500 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse opacity-75"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full p-2 shadow-md">
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="ml-2 text-lg leading-6 font-bold text-white">Mechanical Engineering</h3>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-gray-600">
                    <p className="text-sm">
                      The Mechanical Engineering department focuses on design, manufacturing, and maintenance of mechanical systems and equipment.
                    </p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Code: ME
                    </span>
                    <span className="text-yellow-600 text-sm font-medium flex items-center">
                      View Details
                      <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Electronics & Telecommunication */}
              <div
                className="bg-white overflow-hidden shadow-lg rounded-xl department-card border border-green-100 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => handleOpenDepartmentModal({
                  name: 'Electronics & Telecom',
                  icon: <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>,
                  description: "The Electronics & Telecommunication department covers electronic circuits, communication systems, signal processing, and embedded systems.",
                  subjects: [
                    'Electronic Devices & Circuits',
                    'Digital Electronics & Microprocessors',
                    'Communication Systems',
                    'Signal Processing',
                    'Embedded Systems & IoT'
                  ]
                })}
              >
                {/* Department Image */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={getDepartmentImageUrl('Electronics & Telecom')}
                    alt="Electronics & Telecom Department"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getDepartmentImageUrl('fallback');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute top-0 left-0 right-0">
                    <div className="h-3 bg-green-500 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 animate-pulse opacity-75"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-full p-2 shadow-md">
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                      <h3 className="ml-2 text-lg leading-6 font-bold text-white">Electronics & Telecom</h3>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-gray-600">
                    <p className="text-sm">
                      The Electronics & Telecommunication department covers electronic circuits, communication systems, signal processing, and embedded systems.
                    </p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Code: ET
                    </span>
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      View Details
                      <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Electrical Engineering */}
              <div
                className="bg-white overflow-hidden shadow-lg rounded-xl department-card border border-red-100 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => handleOpenDepartmentModal({
                  name: 'Electrical Engineering',
                  icon: <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>,
                  description: "The Electrical Engineering department focuses on power systems, electrical machines, control systems, and power electronics.",
                  subjects: [
                    'Electrical Machines & Power Systems',
                    'Power Electronics & Drives',
                    'Control Systems',
                    'Electrical Measurements & Instrumentation',
                    'Renewable Energy Systems'
                  ]
                })}
              >
                {/* Department Image */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={getDepartmentImageUrl('Electrical Engineering')}
                    alt="Electrical Engineering Department"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getDepartmentImageUrl('fallback');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute top-0 left-0 right-0">
                    <div className="h-3 bg-red-500 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 animate-pulse opacity-75"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gradient-to-br from-red-500 to-red-600 rounded-full p-2 shadow-md">
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="ml-2 text-lg leading-6 font-bold text-white">Electrical Engineering</h3>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-gray-600">
                    <p className="text-sm">
                      The Electrical Engineering department focuses on power systems, electrical machines, control systems, and power electronics.
                    </p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Code: EE
                    </span>
                    <span className="text-red-600 text-sm font-medium flex items-center">
                      View Details
                      <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Section */}
      <div id="facilities" className="py-20 bg-gradient-to-b from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px), radial-gradient(#7c3aed 1px, transparent 1px)',
            backgroundSize: '40px 40px, 30px 30px',
            backgroundPosition: '0 0, 20px 20px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase inline-block highlight-text">Campus Infrastructure</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl gradient-text">
              Our Facilities
            </p>
            <div className="h-1 w-20 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto mt-4 rounded-full"></div>
            <p className="mt-6 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              State-of-the-art infrastructure designed to provide an optimal learning environment
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* Main Building */}
              <div className="overflow-hidden shadow-lg rounded-xl facility-card">
                <div className="relative h-56">
                  <img
                    src="/images/facilities/main-building.jpg"
                    alt="Main Building - Government Polytechnic College Itarsi"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/fallback-facility.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute top-0 left-0 right-0 h-full flex flex-col justify-end p-4">
                    <div className="flex items-center mb-2">
                      <div className="facility-icon">
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="ml-3 text-xl font-bold text-white">Main Building</h3>
                    </div>
                    <div className="w-16 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full mb-2"></div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Modern classrooms and administrative offices with cutting-edge technology and comfortable learning spaces. The main building houses lecture halls, faculty offices, and administrative departments.
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center facility-feature">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-gray-700">Smart Classrooms</span>
                    </div>
                    <div className="flex items-center facility-feature">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-gray-700">Administrative Offices</span>
                    </div>
                    <div className="flex items-center facility-feature">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-gray-700">Seminar Halls</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Library */}
              <div className="overflow-hidden shadow-lg rounded-xl facility-card">
                <div className="relative h-56">
                  <img
                    src="/images/facilities/library.jpg"
                    alt="Library - Government Polytechnic College Itarsi"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/fallback-facility.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute top-0 left-0 right-0 h-full flex flex-col justify-end p-4">
                    <div className="flex items-center mb-2">
                      <div className="facility-icon">
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="ml-3 text-xl font-bold text-white">Library</h3>
                    </div>
                    <div className="w-16 h-1 bg-gradient-to-r from-accent-500 to-primary-500 rounded-full mb-2"></div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Comprehensive collection of books, journals, and digital resources for research and self-paced learning. Our library provides a quiet environment for study and research.
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center facility-feature">
                      <div className="h-8 w-8 rounded-full bg-accent-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-accent-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-gray-700">Extensive Book Collection</span>
                    </div>
                    <div className="flex items-center facility-feature">
                      <div className="h-8 w-8 rounded-full bg-accent-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-accent-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-gray-700">Digital Resources</span>
                    </div>
                    <div className="flex items-center facility-feature">
                      <div className="h-8 w-8 rounded-full bg-accent-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-accent-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-gray-700">Reading Rooms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Laboratories */}
              <div className="overflow-hidden shadow-lg rounded-xl facility-card">
                <div className="relative h-56">
                  <img
                    src="/images/facilities/laboratories.jpg"
                    alt="Laboratories - Government Polytechnic College Itarsi"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/fallback-facility.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute top-0 left-0 right-0 h-full flex flex-col justify-end p-4">
                    <div className="flex items-center mb-2">
                      <div className="facility-icon">
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <h3 className="ml-3 text-xl font-bold text-white">Laboratories</h3>
                    </div>
                    <div className="w-16 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full mb-2"></div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Well-equipped labs for practical learning, research, and hands-on experience with cutting-edge technology. Each department has specialized laboratories for practical training.
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center facility-feature">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-gray-700">Computer Labs</span>
                    </div>
                    <div className="flex items-center facility-feature">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-gray-700">Electronics & Electrical Labs</span>
                    </div>
                    <div className="flex items-center facility-feature">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-gray-700">Mechanical Workshops</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(30deg, #4f46e5 12%, transparent 12.5%, transparent 87%, #4f46e5 87.5%, #4f46e5), linear-gradient(150deg, #4f46e5 12%, transparent 12.5%, transparent 87%, #4f46e5 87.5%, #4f46e5), linear-gradient(30deg, #4f46e5 12%, transparent 12.5%, transparent 87%, #4f46e5 87.5%, #4f46e5), linear-gradient(150deg, #4f46e5 12%, transparent 12.5%, transparent 87%, #4f46e5 87.5%, #4f46e5), linear-gradient(60deg, #4f46e577 25%, transparent 25.5%, transparent 75%, #4f46e577 75%, #4f46e577), linear-gradient(60deg, #4f46e577 25%, transparent 25.5%, transparent 75%, #4f46e577 75%, #4f46e577)',
            backgroundSize: '80px 140px',
            backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase inline-block highlight-text">Get in Touch</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Contact Information
            </p>
            <div className="h-1 w-20 bg-accent-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="mt-10">
            <div className="bg-white shadow-xl overflow-hidden sm:rounded-xl border border-gray-100 hover-card">
              <div className="px-6 py-8 sm:p-10">
                <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-8">
                  <div className="space-y-8">
                    <div className="flex items-start contact-item">
                      <div className="flex-shrink-0 bg-primary-100 rounded-full p-3">
                        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-lg font-bold text-gray-900">Address</p>
                        <div className="mt-2 text-base text-gray-600">
                          {contactInfo?.address ? (
                            contactInfo.address.split(',').map((line, index) => (
                              <p key={index}>{line.trim()}</p>
                            ))
                          ) : (
                            <>
                              <p>Government Polytechnic College</p>
                              <p>Sankheda Road, Near Canal, Lane 4 Bypass Road</p>
                              <p>Itarsi, District Narmadapuram</p>
                              <p>Madhya Pradesh, India - 461111</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start contact-item">
                      <div className="flex-shrink-0 bg-primary-100 rounded-full p-3">
                        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-lg font-bold text-gray-900">Phone</p>
                        <div className="mt-2 text-base text-gray-600">
                          <p>{contactInfo?.phone || '+91 8964035180'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start contact-item">
                      <div className="flex-shrink-0 bg-primary-100 rounded-full p-3">
                        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-lg font-bold text-gray-900">Email</p>
                        <div className="mt-2 text-base text-gray-600">
                          <p>{contactInfo?.email || 'gpc.itarsi@gmail.com'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary-50 p-6 rounded-xl shadow-inner border border-primary-100">
                      <div className="flex items-center mb-4">
                        <svg className="h-6 w-6 text-primary-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="text-lg font-bold text-primary-800">Office Hours</h4>
                      </div>
                      <div className="ml-9 text-base text-gray-600 space-y-1">
                        {contactInfo?.officeHours ? (
                          <div className="flex justify-between">
                            <span>{contactInfo.officeHours}</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span>Monday - Friday:</span>
                              <span className="font-medium">9:00 AM - 5:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Saturday:</span>
                              <span className="font-medium">9:00 AM - 1:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sunday:</span>
                              <span className="font-medium">Closed</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-xl overflow-hidden shadow-lg border-4 border-white">
                      <iframe
                        src={
                          contactInfo?.mapLocation?.latitude && contactInfo?.mapLocation?.longitude
                            ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3689.7598554645463!2d${contactInfo.mapLocation.longitude}!3d${contactInfo.mapLocation.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397dd0e09b4b9563%3A0x1e4561bb0c94ca0c!2sGovernment%20Polytechnic%20College%2C%20Itarsi!5e0!3m2!1sen!2sin!4v1653472926177!5m2!1sen!2sin`
                            : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3689.7598554645463!2d77.76030000000001!3d22.6123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397dd0e09b4b9563%3A0x1e4561bb0c94ca0c!2sGovernment%20Polytechnic%20College%2C%20Itarsi!5e0!3m2!1sen!2sin!4v1653472926177!5m2!1sen!2sin"
                        }
                        width="100%"
                        height="350"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`GPC Itarsi Location - ${contactInfo?.address || 'Sankheda Road, Near Canal, Lane 4 Bypass Road'}`}
                        className="w-full h-full"
                      ></iframe>
                    </div>

                    <div className="bg-accent-50 p-6 rounded-xl shadow-inner border border-accent-100">
                      <h4 className="text-lg font-bold text-accent-800 mb-4 flex items-center">
                        <svg className="h-6 w-6 text-accent-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Connect With Us
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-base">
                        <a
                          href={contactInfo?.socialMedia?.facebook || "https://www.facebook.com/profile.php?id=61573030583115"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                          </svg>
                          Facebook
                        </a>
                        {(contactInfo?.socialMedia?.instagram || "https://www.instagram.com/gpcitarsi?igsh=M3pveTRrY3J5djZt") && (
                          <a
                            href={contactInfo?.socialMedia?.instagram || "https://www.instagram.com/gpcitarsi?igsh=M3pveTRrY3J5djZt"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-800 flex items-center"
                          >
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                            </svg>
                            Instagram
                          </a>
                        )}
                        <a
                          href={`mailto:${contactInfo?.email || 'gpc.itarsi@gmail.com'}`}
                          className="text-red-600 hover:text-red-800 flex items-center"
                        >
                          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email Us
                        </a>
                        <a
                          href={`tel:${contactInfo?.phone || '+918964035180'}`}
                          className="text-green-600 hover:text-green-800 flex items-center"
                        >
                          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          Call Us
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Details Modal */}
      <CourseDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseDepartmentModal}
        department={selectedDepartment}
      />
    </div>
  );
};

export default About;
