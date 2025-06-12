import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextReveal, CanvasWave, AnimatedCard } from '../components/animations';
import CustomButtonsSection from '../components/CustomButtonsSection';
import NoticeContent from '../components/notices/NoticeContent';

// Import SEO components
import SEO from '../components/SEO';
import SchemaMarkup from '../components/SchemaMarkup';
import { generateBreadcrumbSchema } from '../utils/schemaMarkup';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNoticePopup, setShowNoticePopup] = useState(false);
  const [collegeData, setCollegeData] = useState({
    title: 'Government Polytechnic College Itarsi',
    shortDescription: 'A premier technical institution offering diploma courses in engineering and technology.',
    stats: {
      students: 450,
      teachers: 35,
      courses: 8,
      placements: 85
    },
    establishedYear: 2011
  });

  // Generate breadcrumb schema for the home page
  const breadcrumbSchema = generateBreadcrumbSchema([
    {
      name: 'Home',
      url: 'https://gpc-itarsi-9cl7.onrender.com/'
    }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch notices
        const noticesResponse = await axios.get(`${config.apiUrl}/api/notices`);

        if (noticesResponse.data && Array.isArray(noticesResponse.data)) {
          // Sort notices by date (newest first) and get only the latest 5
          const sortedNotices = [...noticesResponse.data].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
          ).slice(0, 5);

          setNotices(sortedNotices);

          // Check for important notices
          const importantNotices = sortedNotices.filter(notice => notice.important === true);
          const hasImportantNotices = importantNotices.length > 0;

          if (hasImportantNotices) {
            // Show notice popup after notices are loaded with a small delay
            // Always show popup on page refresh
            setTimeout(() => {
              setShowNoticePopup(true);
            }, 500);
          }
        } else {
          console.error('Invalid notices data format:', noticesResponse.data);
          setNotices([]);
        }

        // Fetch college overview data
        try {
          const overviewResponse = await axios.get(`${config.apiUrl}/api/overview`);
          if (overviewResponse.data) {
            setCollegeData({
              title: overviewResponse.data.title || 'Government Polytechnic College, Itarsi',
              shortDescription: overviewResponse.data.shortDescription || 'A premier technical institution offering diploma courses in engineering and technology.',
              stats: overviewResponse.data.stats || {
                students: 450,
                teachers: 35,
                courses: 8,
                placements: 85
              },
              establishedYear: overviewResponse.data.establishedYear || 2011
            });
          }
        } catch (overviewError) {
          console.error('Error fetching college overview:', overviewError);
          // Keep default values set in useState
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Reset popup state when component unmounts
    return () => {
      setShowNoticePopup(false);
    };
  }, []);

  return (
    <div className="bg-white">
      {/* SEO Optimization */}
      <SEO
        title="Government Polytechnic College Itarsi - Official Website"
        description="Welcome to Government Polytechnic College Itarsi (GPC Itarsi). A premier technical institution offering diploma courses in engineering and technology. Join GPCI for quality education."
        keywords="Government Polytechnic College Itarsi, GPC Itarsi, GPCI, Polytechnic College Itarsi, GPC, Polytechnic, Government Polytechnic, technical education, diploma courses"
        ogImage="/college-og-image.jpg"
      />

      {/* Schema.org Breadcrumb Markup */}
      <SchemaMarkup schema={breadcrumbSchema} id="breadcrumb-schema" />

      {/* Notice Popup */}
      {showNoticePopup && notices.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowNoticePopup(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-primary-600" id="modal-title">
                        Important Notices
                      </h3>
                      <button
                        onClick={() => setShowNoticePopup(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-4">
                      <ul className="divide-y divide-gray-200">
                        {notices
                          .filter(notice => notice.important) // Only show important notices in the popup
                          .map((notice) => (
                            <li key={notice._id} className="py-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-primary-500 truncate">
                                  {notice.title}
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-200 text-accent-700">
                                    Important
                                  </span>
                                </p>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    {new Date(notice.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-1 text-sm text-secondary-600">
                                <NoticeContent
                                  content={notice.content}
                                  maxLength={100}
                                  truncate={notice.content.length > 100}
                                />
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowNoticePopup(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continuous Background Wrapper for all themed sections */}
      <div className="relative bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-900 bg-fixed">
        {/* Global animated background elements that will be visible across all sections */}
        <div className="absolute inset-0 overflow-hidden fixed">
          {/* Animated circles */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="hero-circle hero-circle-1"></div>
            <div className="hero-circle hero-circle-2"></div>
            <div className="hero-circle hero-circle-3"></div>
            <div className="hero-circle hero-circle-4"></div>
            <div className="hero-circle hero-circle-5"></div>
            <div className="hero-circle hero-circle-6"></div>
          </div>

          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-500/20 via-primary-500/20 to-transparent"></div>

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>

        {/* Hero Section - Enhanced Professional Design */}
        <header className="relative overflow-hidden min-h-[85vh] flex items-center pt-4">
          {/* Additional decorative elements */}
          <div className="absolute top-1/4 right-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 left-10 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>

          {/* Content */}
        <div className="relative w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left column - Text content */}
            <div className="text-left">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-500/20 text-primary-300 text-sm font-semibold mb-6 backdrop-blur-sm border border-primary-400/20 shadow-sm animate-fadeIn">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="relative overflow-hidden">
                    <span>Welcome to Excellence</span>
                  </span>
                </span>
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 pb-2">
                    Government
                  </span>
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 pb-2">
                    Polytechnic
                  </span>
                  <span className="block">
                    College <span className="text-accent-400 relative inline-block">
                      Itarsi
                      <span className="absolute -bottom-2 left-0 w-full h-1 bg-accent-500/50 rounded-full"></span>
                    </span>
                  </span>
                </h1>
                <div className="w-20 h-1.5 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full mt-2"></div>
                <p className="mt-6 text-xl text-gray-200 max-w-2xl text-shadow leading-relaxed">
                  {collegeData.shortDescription}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="bg-primary-800/30 backdrop-blur-sm rounded-lg p-3 border border-primary-700/30 hover:border-primary-600/40 transition-all duration-300 hover:bg-primary-800/40 group">
                  <div className="text-3xl font-bold text-white group-hover:text-accent-300 transition-colors duration-300">
                    {new Date().getFullYear() - collegeData.establishedYear}+
                  </div>
                  <div className="text-sm text-gray-300">Years of Excellence</div>
                </div>
                <div className="bg-primary-800/30 backdrop-blur-sm rounded-lg p-3 border border-primary-700/30 hover:border-primary-600/40 transition-all duration-300 hover:bg-primary-800/40 group">
                  <div className="text-3xl font-bold text-white group-hover:text-accent-300 transition-colors duration-300">
                    {collegeData.stats.courses}+
                  </div>
                  <div className="text-sm text-gray-300">Programs Offered</div>
                </div>
                <div className="bg-primary-800/30 backdrop-blur-sm rounded-lg p-3 border border-primary-700/30 hover:border-primary-600/40 transition-all duration-300 hover:bg-primary-800/40 group">
                  <div className="text-3xl font-bold text-white group-hover:text-accent-300 transition-colors duration-300">
                    {collegeData.stats.placements}%
                  </div>
                  <div className="text-sm text-gray-300">Placement Rate</div>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/courses"
                  className="hero-btn programs-btn flex items-center justify-center px-8 py-4 border border-primary-400/30 text-base font-medium rounded-md text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 backdrop-blur-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  View Our Programs
                </Link>
                <Link
                  to="/about"
                  className="hero-btn learn-btn flex items-center justify-center px-8 py-4 border border-accent-400/30 text-base font-medium rounded-md text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 backdrop-blur-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Learn More
                </Link>
                <Link
                  to="/admission"
                  className="hero-btn admission-btn flex items-center justify-center px-8 py-4 border border-success/30 text-base font-medium rounded-md text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 backdrop-blur-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Admission
                </Link>
              </div>
            </div>

            {/* Right column - Campus Image (Desktop) */}
            <div className="hidden lg:flex relative justify-center items-center">
              <div className="relative rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl overflow-hidden w-full h-[450px] group hover:shadow-accent-500/20 hover:border-white/30 transition-all duration-500">
                {/* Campus Image with Color Filter */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src="images/campus.jpg"
                    alt="Campus"
                    className="w-full h-full object-cover object-center transition-transform duration-10000 group-hover:scale-105"
                  />
                  {/* No color filter overlay */}
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-500 rounded-full opacity-20 blur-2xl animate-pulse-slow"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-500 rounded-full opacity-20 blur-2xl animate-pulse-slow animation-delay-2000"></div>

                {/* College emblem/logo overlay */}
                <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/20 shadow-lg">
                  <div className="text-white text-sm font-semibold">Est. 2011</div>
                </div>

                {/* Accreditation badges */}
                <div className="absolute top-4 left-4 flex space-x-2">
                  <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20 shadow-lg">
                    <div className="text-white text-xs font-semibold">AICTE Approved</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20 shadow-lg">
                    <div className="text-white text-xs font-semibold">ISO 9001:2015</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Campus Image */}
            <div className="lg:hidden relative mt-4 mb-2">
              <div className="relative rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl overflow-hidden w-full h-[220px] group hover:shadow-accent-500/20 hover:border-white/30 transition-all duration-500">
                {/* Campus Image with Color Filter */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src="images/campus.jpg"
                    alt="Campus"
                    className="w-full h-full object-cover object-center transition-transform duration-10000 group-hover:scale-105"
                  />
                  {/* No color filter overlay */}
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10"></div>

                {/* College emblem/logo overlay */}
                <div className="absolute bottom-2 right-2 bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20 shadow-lg">
                  <div className="text-white text-xs font-semibold">Est. 2011</div>
                </div>

                {/* Accreditation badges - mobile */}
                <div className="absolute top-2 left-2 flex space-x-1">
                  <div className="bg-white/10 backdrop-blur-md p-1 rounded-lg border border-white/20 shadow-lg">
                    <div className="text-white text-[10px] font-semibold">AICTE</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-1 rounded-lg border border-white/20 shadow-lg">
                    <div className="text-white text-[10px] font-semibold">ISO</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator - hidden on small screens, visible on medium and up */}
          <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 flex-col items-center hidden md:flex">
            <span className="text-white text-sm mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
              <div className="w-1.5 h-3 bg-white rounded-full animate-bounce-slow"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Section Divider */}
      <div className="relative">
        <div className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent to-primary-800/40"></div>
      </div>

      {/* Our Campus Section - Professional Design */}
      <section aria-labelledby="campus-section-title" className="relative py-12 overflow-hidden">
        {/* Background elements similar to hero section */}
        <div className="absolute inset-0 z-0">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500/10 via-accent-500/10 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-500/20 text-primary-300 text-sm font-semibold mb-4 backdrop-blur-sm shadow-sm border border-primary-400/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Explore Our Facilities
            </div>
            <TextReveal id="campus-section-title" className="mt-2 text-5xl font-extrabold text-white sm:text-6xl tracking-tight">
              Our <span className="text-accent-500 relative inline-block">
                Campus
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-accent-500/50 rounded-full"></span>
              </span>
            </TextReveal>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full mx-auto mt-6"></div>
            <TextReveal className="mt-6 max-w-2xl text-xl text-gray-200 lg:mx-auto leading-relaxed" delay={0.3}>
              Discover our modern campus with state-of-the-art facilities designed to provide an exceptional learning environment for all students.
            </TextReveal>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-y-10 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Campus Building */}
            <AnimatedCard className="group relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-white/20 transform hover:-translate-y-2 hover:border-white/30" delay={0.1}>
              <div className="absolute top-4 left-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white p-3 rounded-xl z-10 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="relative w-full h-64 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: 'url(/images/campus.jpg)' }}
                ></div>
                {/* No color filter overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg shadow-lg border border-white/20">
                    <p className="text-white text-sm font-medium">State-of-the-art infrastructure</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-300 transition-colors">
                  Main Building
                </h3>
                <p className="text-gray-300 mb-4">Modern classrooms and administrative offices with cutting-edge technology and comfortable learning spaces.</p>
                <a href="/about#facilities" className="inline-flex items-center text-primary-300 font-medium hover:text-accent-300 transition-colors">
                  <span className="relative">
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-400/30 group-hover:bg-accent-400/30 transition-colors"></span>
                    Learn more
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </AnimatedCard>

            {/* Library */}
            <AnimatedCard className="group relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-white/20 transform hover:-translate-y-2 hover:border-white/30" delay={0.3}>
              <div className="absolute top-4 left-4 bg-gradient-to-br from-primary-600 to-accent-600 text-white p-3 rounded-xl z-10 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="relative w-full h-64 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: 'url(/images/library1.jpg)' }}
                ></div>
                {/* No color filter overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg shadow-lg border border-white/20">
                    <p className="text-white text-sm font-medium">Extensive collection of resources</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-300 transition-colors">
                  Library
                </h3>
                <p className="text-gray-300 mb-4">Comprehensive collection of books, journals, and digital resources for research and self-paced learning.</p>
                <a href="/about#facilities" className="inline-flex items-center text-primary-300 font-medium hover:text-accent-300 transition-colors">
                  <span className="relative">
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-400/30 group-hover:bg-accent-400/30 transition-colors"></span>
                    Learn more
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </AnimatedCard>

            {/* Labs */}
            <AnimatedCard className="group relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-white/20 transform hover:-translate-y-2 hover:border-white/30" delay={0.5}>
              <div className="absolute top-4 left-4 bg-gradient-to-br from-accent-600 to-accent-700 text-white p-3 rounded-xl z-10 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="relative w-full h-64 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1650&q=80)' }}
                ></div>
                {/* No color filter overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg shadow-lg border border-white/20">
                    <p className="text-white text-sm font-medium">Hands-on practical learning</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-300 transition-colors">
                  Laboratories
                </h3>
                <p className="text-gray-300 mb-4">Well-equipped labs for practical learning, research, and hands-on experience with cutting-edge technology.</p>
                <a href="/about#facilities" className="inline-flex items-center text-primary-300 font-medium hover:text-accent-300 transition-colors">
                  <span className="relative">
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-400/30 group-hover:bg-accent-400/30 transition-colors"></span>
                    Learn more
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </AnimatedCard>
          </div>

          {/* View all facilities button */}
          <div className="mt-16 text-center">
            <a
              href="/about#facilities"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg text-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 group relative overflow-hidden bg-gradient-to-r from-primary-800 via-primary-700 to-primary-800 border border-primary-600/30 backdrop-blur-sm"
            >
              {/* Animated gradient overlay */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent-500/20 via-primary-500/20 to-accent-500/20 bg-[length:200%_100%] animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>

              {/* Glow effect */}
              <span className="absolute inset-0 w-full h-full rounded-lg blur opacity-0 group-hover:opacity-70 transition-opacity duration-500 bg-gradient-to-r from-accent-400/30 to-primary-400/30 group-hover:blur-md"></span>

              {/* Grid pattern */}
              <span className="absolute inset-0 bg-grid-pattern opacity-10"></span>

              {/* Button content */}
              <span className="relative flex items-center z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                View All Facilities
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </section>



      {/* Custom Buttons Section */}
      <CustomButtonsSection />

      {/* Section Divider */}
      <div className="relative">
        <div className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent to-primary-800/30"></div>
      </div>

      {/* Notices Section */}
      <section aria-labelledby="notices-section-title" className="relative py-12 overflow-hidden">
        {/* Background elements similar to hero section */}
        <div className="absolute inset-0 z-0">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500/10 via-accent-500/10 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-500/20 text-primary-300 text-sm font-semibold mb-4 backdrop-blur-sm shadow-sm border border-primary-400/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Announcements
            </div>
            <TextReveal id="notices-section-title" className="mt-2 text-5xl font-extrabold text-white sm:text-4xl tracking-tight">
              Latest <span className="text-accent-500 relative inline-block">
                Notices
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-accent-500/50 rounded-full"></span>
              </span>
            </TextReveal>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full mx-auto mt-6"></div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg shadow-lg overflow-hidden rounded-xl border border-white/20">
            {loading ? (
              <div className="py-10 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
                <p className="mt-2 text-gray-200">Loading notices...</p>
              </div>
            ) : error ? (
              <div className="py-10 text-center text-red-300">{error}</div>
            ) : notices.length === 0 ? (
              <div className="py-10 text-center text-gray-200">No notices available</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {notices.map((notice) => (
                  <li key={notice._id} className="hover:bg-white/5 transition-colors duration-200">
                    <div className="px-6 py-5 sm:px-8">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate flex items-center">
                          {notice.important && (
                            <span className="mr-2 flex-shrink-0 w-2 h-2 rounded-full bg-accent-500 animate-pulse"></span>
                          )}
                          {notice.title}
                          {notice.important && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-500/20 text-accent-300 border border-accent-500/30">
                              Important
                            </span>
                          )}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-800/50 text-gray-200 border border-primary-700/30">
                            {new Date(notice.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <div className="text-sm text-gray-300">
                            <NoticeContent
                              content={notice.content}
                              darkTheme={true}
                              maxLength={150}
                              truncate={notice.content.length > 150}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="relative">
        <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent to-primary-800/30"></div>
      </div>

      {/* Call to Action Section */}
      <section aria-labelledby="cta-section-title" className="relative overflow-hidden">
        {/* Background elements similar to hero section */}
        <div className="absolute inset-0 z-0">
          {/* Animated circles */}
          <div className="hero-circle hero-circle-1 opacity-30"></div>
          <div className="hero-circle hero-circle-2 opacity-30"></div>
          <div className="hero-circle hero-circle-3 opacity-30"></div>

          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent-500/20 via-primary-500/20 to-transparent"></div>

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>

        <CanvasWave color="rgba(255, 255, 255, 0.1)" height={100} speed={0.15} />
        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:py-28 sm:px-6 lg:px-8 z-10">
          {/* Decorative element */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-500/20 text-primary-300 text-sm font-semibold mb-4 backdrop-blur-sm shadow-sm border border-primary-400/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ready to Join Us?
          </div>

          <TextReveal id="cta-section-title" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Begin Your Educational <span className="text-accent-500 relative inline-block">
              Journey
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-accent-500/50 rounded-full"></span>
            </span> With Us
          </TextReveal>
          <div className="w-24 h-1.5 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full mt-6 mb-6"></div>
          <TextReveal className="mt-6 max-w-3xl text-lg text-white leading-relaxed" delay={0.3}>
            Join our institution to gain quality technical education and build a successful career. Our experienced faculty and modern facilities provide an ideal learning environment.
          </TextReveal>
          <div className="mt-12">
            <Link
              to="/admission"
              className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-xl text-white transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 group relative overflow-hidden bg-gradient-to-r from-accent-600 to-accent-700 border border-accent-500/30"
            >
              {/* Pulsing glow effect */}
              <span className="absolute inset-0 w-full h-full rounded-xl blur-md group-hover:blur-xl opacity-70 group-hover:opacity-90 transition-all duration-500 bg-accent-400 animate-pulse-slow"></span>

              {/* Shine effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>

              {/* Grid pattern */}
              <span className="absolute inset-0 bg-grid-pattern opacity-10"></span>

              {/* Button content */}
              <span className="relative flex items-center z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Apply for Admission
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default Home;
