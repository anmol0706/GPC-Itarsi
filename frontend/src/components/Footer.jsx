import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import collegeLogo from '../assets/college-logo.png';
import DeveloperCard from './DeveloperCard';
import { getProfileImageUrl, handleImageError } from '../utils/imageUtils';
import config from '../config';
import './Footer.css'; // Import custom footer styles
import { gsap } from 'gsap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showDeveloperCard, setShowDeveloperCard] = useState(false);
  const [developer, setDeveloper] = useState(null);
  const [contactInfo, setContactInfo] = useState({
    address: 'Sankheda Road, Near Canal, Lane 4 Bypass Road, Itarsi, District Narmadapuram',
    phone: '+91 8964035180',
    email: 'gpc.itarsi@gmail.com',
    socialMedia: {
      facebook: 'https://www.facebook.com/profile.php?id=61573030583115',
      instagram: 'https://www.instagram.com/gpcitarsi?igsh=M3pveTRrY3J5djZt'
    }
  });

  // Refs for animations
  const footerRef = useRef(null);
  const socialIconsRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // Fetch contact information
    const fetchContactInfo = async () => {
      try {
        console.log('Fetching contact information from:', `${config.apiUrl}/api/contact-info`);
        const response = await axios.get(`${config.apiUrl}/api/contact-info`);
        if (response.data) {
          console.log('Contact info received:', response.data);
          // Ensure socialMedia object exists and has default values if missing
          const updatedContactInfo = {
            ...response.data,
            socialMedia: {
              facebook: 'https://www.facebook.com/profile.php?id=61573030583115',
              instagram: 'https://www.instagram.com/gpcitarsi?igsh=M3pveTRrY3J5djZt',
              ...(response.data.socialMedia || {})
            }
          };
          console.log('Updated contact info with defaults:', updatedContactInfo);
          setContactInfo(updatedContactInfo);
        }
      } catch (error) {
        console.error('Error fetching contact information:', error);
        // Keep default values set in useState
      }
    };

    // Fetch developer information
    const fetchDeveloperData = async () => {
      try {
        console.log('Fetching developer profile from:', `${config.apiUrl}/api/developer/profile-public`);
        const response = await axios.get(`${config.apiUrl}/api/developer/profile-public`);
        if (response.data) {
          console.log('Developer data received:', response.data);
          setDeveloper(response.data);
        }
      } catch (error) {
        console.error('Error fetching developer information:', error);
        // Set default developer data
        const defaultDeveloper = {
          name: 'Anmol Malviya',
          title: 'Web Developer',
          profilePicture: null,
          bio: 'I am a web developer specializing in React and Node.js.',
          socialLinks: {
            github: 'https://github.com/anmolmalviya',
            portfolio: 'https://anmolmalviya.com',
            instagram: 'https://instagram.com/anmolmalviya',
            linkedin: 'https://linkedin.com/in/anmolmalviya',
            twitter: 'https://twitter.com/anmolmalviya',
            email: 'anmolmalviya4328@gmail.com'
          }
        };
        console.log('Using default developer data:', defaultDeveloper);
        setDeveloper(defaultDeveloper);
      }
    };

    fetchContactInfo();
    fetchDeveloperData();

    // Handle scroll for back to top button
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    // Apply animations when component mounts
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { scale: 0.9, opacity: 0.7 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.5,
          ease: "elastic.out(1, 0.5)",
          repeat: -1,
          yoyo: true,
          repeatDelay: 3
        }
      );
    }

    if (socialIconsRef.current) {
      gsap.fromTo(
        socialIconsRef.current.children,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out"
        }
      );
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="relative futuristic-footer text-white shadow-lg">
      {/* Tech pattern background */}
      <div className="footer-tech-pattern"></div>

      {/* Wave decoration at the top */}
      <div className="footer-wave"></div>

      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold mb-4 footer-heading">GPC Itarsi</h3>
            <div className="flex justify-center sm:justify-start mb-4">
              <div className="footer-logo-container w-20 h-20 bg-white rounded-full flex items-center justify-center mb-3 p-2 overflow-hidden shadow-md relative" ref={logoRef}>
                <div className="footer-logo-glow"></div>
                <img src={collegeLogo} alt="GPC Itarsi Logo" className="w-full h-full object-contain relative z-10" />
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Providing quality education and fostering academic excellence since 2011.
            </p>
            <div className="flex justify-center sm:justify-start space-x-5 mt-6" ref={socialIconsRef}>
              {/* Always render Facebook icon with fallback URL */}
              <a
                href={contactInfo?.socialMedia?.facebook || "https://www.facebook.com/profile.php?id=61573030583115"}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon text-blue-400 p-2"
                onClick={(e) => {
                  if (!contactInfo?.socialMedia?.facebook) {
                    console.log('Using fallback Facebook URL');
                  }
                }}
              >
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              {/* Always render Instagram icon with fallback URL */}
              <a
                href={contactInfo?.socialMedia?.instagram || "https://www.instagram.com/gpcitarsi?igsh=M3pveTRrY3J5djZt"}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon text-pink-400 p-2"
                onClick={(e) => {
                  if (!contactInfo?.socialMedia?.instagram) {
                    console.log('Using fallback Instagram URL');
                  }
                }}
              >
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href={`mailto:${contactInfo?.email || 'gpc.itarsi@gmail.com'}`} className="footer-social-icon text-cyan-400 p-2 email-icon">
                <span className="sr-only">Email</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="3" className="email-icon-body" />
                  <path className="email-icon-wave" d="M22 7l-10 5-10-5" />
                  <circle cx="18" cy="6" r="1" className="email-icon-dot" />
                  <path className="email-icon-circuit" d="M2 15h4m-2 2v-4" />
                </svg>
                <span className="email-icon-glow"></span>
              </a>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold mb-5 footer-heading">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="footer-quick-link text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="footer-quick-link text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path></svg>
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="footer-quick-link text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path></svg>
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer-quick-link text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                  About
                </Link>
              </li>
              <li>
                <Link to="/admission" className="footer-quick-link text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path></svg>
                  Admission
                </Link>
              </li>
              <li>
                <Link to="/login" className="footer-quick-link text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  Login
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-5 footer-heading">Contact Us</h3>
            <address className="not-italic text-gray-300 space-y-3">
              <div className="footer-contact-item flex items-center justify-center md:justify-start">
                <svg className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                <p>{contactInfo?.address || 'Sankheda Road, Near Canal, Lane 4 Bypass Road, Itarsi, District Narmadapuram'}</p>
              </div>
              <div className="footer-contact-item flex items-center justify-center md:justify-start">
                <svg className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>
                <p>Madhya Pradesh, India</p>
              </div>
              <div className="footer-contact-item flex items-center justify-center md:justify-start">
                <svg className="w-5 h-5 mr-3 text-cyan-400 flex-shrink-0 contact-email-icon" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="3" className="email-icon-body" />
                  <path className="email-icon-wave" d="M22 7l-10 5-10-5" />
                  <circle cx="18" cy="6" r="1" className="email-icon-dot" />
                </svg>
                <p>Email: <a href={`mailto:${contactInfo?.email || 'gpc.itarsi@gmail.com'}`} className="hover:text-cyan-400 transition-colors duration-300">{contactInfo?.email || 'gpc.itarsi@gmail.com'}</a></p>
              </div>
              <div className="footer-contact-item flex items-center justify-center md:justify-start">
                <svg className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                <p>Phone: <a href={`tel:${contactInfo?.phone || '+918964035180'}`} className="hover:text-blue-400 transition-colors duration-300">{contactInfo?.phone || '+91 8964035180'}</a></p>
              </div>
              {contactInfo?.officeHours && (
                <div className="footer-contact-item flex items-center justify-center md:justify-start">
                  <svg className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>
                  <p>Office Hours: {contactInfo.officeHours}</p>
                </div>
              )}
            </address>
          </div>
        </div>
        <div className="footer-divider mt-10 mb-8 relative">
          <div className="footer-divider-dot"></div>
        </div>
        <div className="pt-2 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-4 md:mb-0">
              <p>&copy; {currentYear} <span className="text-blue-400 font-medium">Government Polytechnic College, Itarsi</span>. All rights reserved.</p>
              <div className="mt-4 inline-block">
                <button
                  onClick={() => setShowDeveloperCard(true)}
                  className="py-2 px-4 bg-gradient-to-r from-blue-800 to-indigo-900 rounded shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 group flex items-center space-x-2 relative overflow-hidden border border-blue-700/50"
                >
                  {/* Tech pattern background */}
                  <div className="absolute inset-0 opacity-10 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white"></div>
                  </div>

                  {/* Animated tech effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent w-[200%] h-full -translate-x-full group-hover:translate-x-[75%] transition-transform duration-1000 ease-in-out"></div>

                  <div className="relative z-10 flex items-center">
                    <div className="w-8 h-8 rounded overflow-hidden mr-2 border border-blue-400 shadow-inner group-hover:border-blue-300 transition-all duration-300 bg-blue-900/50 p-0.5">
                      <img
                        src={getProfileImageUrl(developer?.profilePicture)}
                        alt={developer?.name || "Developer"}
                        className="w-full h-full object-cover rounded group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          console.log('Footer developer image error, using fallback');
                          e.target.onerror = null;
                          e.target.src = 'https://res.cloudinary.com/daf99zan2/image/upload/v1746966715/gpc-itarsi/profiles/profilePicture-1746966715084-977581870.webp';
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-white text-sm font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Developer: <span className="font-bold group-hover:text-blue-300 transition-colors duration-300 ml-1">{developer?.name || "Anmol Malviya"}</span>
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              <a href="#" className="hover:text-blue-400 transition-colors duration-300 mx-2">Privacy Policy</a>
              <span className="text-gray-600">|</span>
              <a href="#" className="hover:text-blue-400 transition-colors duration-300 mx-2">Terms of Service</a>
              <span className="text-gray-600">|</span>
              <a href="#" className="hover:text-blue-400 transition-colors duration-300 mx-2">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
      {/* Back to Top Button */}
      {/* Developer Card Modal */}
      <DeveloperCard
        isOpen={showDeveloperCard}
        onClose={() => setShowDeveloperCard(false)}
        developerData={developer}
      />

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="footer-back-to-top"
          aria-label="Back to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </footer>
  );
};

export default Footer;
