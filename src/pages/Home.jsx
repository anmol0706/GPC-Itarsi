import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import sanitizeHtml from '../utils/sanitizeHtml';
import { API_URL } from '../config/api';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatedBackground, TextReveal, CanvasWave, AnimatedCard } from '../components/animations';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNoticePopup, setShowNoticePopup] = useState(false);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/notices`);

        if (response.data && Array.isArray(response.data)) {
          // Sort notices by date (newest first) and get only the latest 5
          const sortedNotices = [...response.data].sort((a, b) =>
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
          console.error('Invalid notices data format:', response.data);
          setNotices([]);
        }
      } catch (error) {
        console.error('Error fetching notices:', error);
        setError('Failed to load notices');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();

    // Reset popup state when component unmounts
    return () => {
      setShowNoticePopup(false);
    };
  }, []);

  return (
    <div className="bg-white">
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
                              <div className="mt-1">
                                <div className="text-sm text-secondary-600">
                                  {notice.content.length > 100
                                    ? <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(`${notice.content.substring(0, 100)}...`) }} />
                                    : <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(notice.content) }} />}
                                </div>
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
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <AnimatedBackground />

        {/* Full-width background image with overlay */}
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="src\assets\background.jpg"
            alt="College campus building"
          />
          <div className="absolute inset-0 bg-secondary-900 opacity-80"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="text-center">
            <TextReveal className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span>Government Polytechnic <span className="text-accent-500">College</span></span>
            </TextReveal>
            <TextReveal className="mt-6 max-w-lg mx-auto text-xl text-white sm:max-w-3xl" delay={0.5}>
              A premier institution offering quality technical education and fostering academic excellence to create industry-ready professionals.
            </TextReveal>
            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-3 sm:gap-5">
                <Link
                  to="/courses"
                  className="hero-btn programs-btn flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 md:py-4 md:text-lg md:px-10 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  View Our Programs
                </Link>
                <Link
                  to="/about"
                  className="hero-btn learn-btn flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent-500 hover:bg-accent-600 md:py-4 md:text-lg md:px-10 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Learn More
                </Link>
                <Link
                  to="/admission"
                  className="hero-btn admission-btn flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-success hover:bg-green-600 md:py-4 md:text-lg md:px-10 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Admission
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Campus Section */}
      <div className="bg-secondary-50 py-16 relative">
        <CanvasWave color="rgba(20, 126, 251, 0.1)" height={150} speed={0.05} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">
              Facilities
            </h2>
            <TextReveal className="mt-2 text-3xl font-extrabold text-primary-600 sm:text-4xl">
              Our Campus
            </TextReveal>
            <TextReveal className="mt-4 max-w-2xl text-xl text-secondary-600 lg:mx-auto" delay={0.3}>
              Explore our modern campus with state-of-the-art facilities designed to enhance your learning experience.
            </TextReveal>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Campus Building */}
            <AnimatedCard className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-secondary-200" delay={0.1}>
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src="src\assets\background.jpg"
                  alt="Modern campus building"
                  className="w-full h-full object-center object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-primary-500">
                  Main Building
                </h3>
                <p className="text-sm text-secondary-600">Modern classrooms and administrative offices.</p>
              </div>
            </AnimatedCard>

            {/* Library */}
            <AnimatedCard className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-secondary-200" delay={0.3}>
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src="src\assets\library1.jpg"
                  alt="College library"
                  className="w-full h-full object-center object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-primary-500">
                  Library
                </h3>
                <p className="text-sm text-secondary-600">Extensive collection of books, journals, and digital resources.</p>
              </div>
            </AnimatedCard>

            {/* Labs */}
            <AnimatedCard className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-secondary-200" delay={0.5}>
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1650&q=80"
                  alt="Computer lab"
                  className="w-full h-full object-center object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-primary-500">
                  Laboratories
                </h3>
                <p className="text-sm text-secondary-600">Well-equipped labs for practical learning and research.</p>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>

      {/* Notices Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Announcements</h2>
            <TextReveal className="mt-2 text-3xl font-extrabold text-primary-600 sm:text-4xl">
              Latest Notices
            </TextReveal>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-secondary-200">
            {loading ? (
              <div className="py-10 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-2 text-secondary-600">Loading notices...</p>
              </div>
            ) : error ? (
              <div className="py-10 text-center text-error">{error}</div>
            ) : notices.length === 0 ? (
              <div className="py-10 text-center text-secondary-600">No notices available</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notices.map((notice) => (
                  <li key={notice._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-primary-500 truncate">
                          {notice.title}
                          {notice.important && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-200 text-accent-700">
                              Important
                            </span>
                          )}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {new Date(notice.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <div className="text-sm text-secondary-600">
                            {notice.content.length > 150
                              ? <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(`${notice.content.substring(0, 150)}...`) }} />
                              : <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(notice.content) }} />}
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
      </div>

      {/* Call to Action Section */}
      <div className="relative bg-primary-600 overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1350&q=80"
            alt="Students in classroom"
          />
          <div className="absolute inset-0 bg-secondary-900 opacity-80"></div>
        </div>
        <CanvasWave color="rgba(255, 255, 255, 0.1)" height={100} speed={0.15} />
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <TextReveal className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Begin Your Educational Journey With Us
          </TextReveal>
          <TextReveal className="mt-6 max-w-3xl text-lg text-white" delay={0.3}>
            Join our institution to gain quality technical education and build a successful career. Our experienced faculty and modern facilities provide an ideal learning environment.
          </TextReveal>
          <div className="mt-8">
            <Link
              to="/admission"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-500 bg-white hover:bg-secondary-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Apply for Admission
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
