import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import config from '../config';
import { getProfileImageUrl } from '../utils/imageUtils';

// Add CSS animation keyframes at the component level
import './DeveloperCard.css';

const DeveloperCard = ({ isOpen, onClose, developerData }) => {
  const modalRef = useRef(null);
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // No longer using auth context or developer panel navigation

  // Use passed developer data or fetch if not provided
  useEffect(() => {
    if (isOpen) {
      if (developerData) {
        console.log('Using provided developer data:', developerData);
        setDeveloper(developerData);
        setLoading(false);
      } else {
        const fetchDeveloperData = async () => {
          try {
            setLoading(true);
            setError(null);
            console.log('Fetching developer data from API...');
            const response = await axios.get(`${config.apiUrl}/api/developer/profile-public`);
            if (response.data) {
              console.log('Developer data received:', response.data);
              setDeveloper(response.data);
            }
          } catch (err) {
            console.error('Error fetching developer data:', err);
            setError('Failed to load developer information');
            // Set default developer data
            const defaultDeveloper = {
              name: 'Anmol Malviya',
              title: 'Web Developer',
              profilePicture: null,
              bio: 'Full-stack web developer specializing in React and Node.js',
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
          } finally {
            setLoading(false);
          }
        };

        fetchDeveloperData();
      }
    }
  }, [isOpen, developerData]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close modal on escape key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center p-4">
        {/* Tech pattern background */}
        <div className="absolute inset-0 tech-pattern opacity-20"></div>

        <div className="glass-effect bg-gradient-to-br from-[#0a1128] via-[#1e3a8a] to-[#1e40af] p-8 rounded-xl shadow-2xl flex flex-col items-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

          {/* Futuristic spinner */}
          <div className="relative w-16 h-16 mb-5">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 opacity-70" style={{animation: 'pulse 1.5s infinite'}}></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-1 rounded-full border-2 border-r-purple-500 border-t-transparent border-b-transparent border-l-transparent animate-spin" style={{animationDuration: '1.2s', animationDirection: 'reverse'}}></div>
            <div className="absolute inset-2 rounded-full border-2 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent animate-spin" style={{animationDuration: '2s'}}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-cyan-400 rounded-full" style={{animation: 'pulse 2s infinite'}}></div>
            </div>
          </div>

          <p className="text-white text-center font-medium tracking-wider" style={{textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'}}>
            LOADING DEVELOPER PROFILE
          </p>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mt-3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center p-4">
        {/* Tech pattern background */}
        <div className="absolute inset-0 tech-pattern opacity-20"></div>

        <div className="glass-effect bg-gradient-to-br from-[#0a1128] via-[#1e3a8a] to-[#1e40af] p-8 rounded-xl shadow-2xl relative overflow-hidden max-w-xs w-full">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>

          <div className="text-red-400 mb-5 flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-red-400/30 opacity-70" style={{animation: 'pulse 1.5s infinite'}}></div>
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 0 8px rgba(248, 113, 113, 0.6))'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <p className="text-white text-center mb-6 leading-relaxed" style={{textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'}}>
            {error}
          </p>

          <button
            onClick={onClose}
            className="futuristic-button w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-md text-white font-medium shadow-lg flex items-center justify-center"
            style={{
              boxShadow: '0 4px 10px rgba(248, 113, 113, 0.3), 0 0 15px rgba(248, 113, 113, 0.2)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}
          >
            <span className="tracking-wider">CLOSE</span>
          </button>
        </div>
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center p-4">
        {/* Tech pattern background */}
        <div className="absolute inset-0 tech-pattern opacity-20"></div>

        <div className="glass-effect bg-gradient-to-br from-[#0a1128] via-[#1e3a8a] to-[#1e40af] p-8 rounded-xl shadow-2xl relative overflow-hidden max-w-xs w-full">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>

          <div className="text-yellow-400 mb-5 flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-yellow-400/30 opacity-70" style={{animation: 'pulse 1.5s infinite'}}></div>
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <p className="text-white text-center mb-6 leading-relaxed" style={{textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'}}>
            No developer information available.
          </p>

          <button
            onClick={onClose}
            className="futuristic-button w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-md text-white font-medium shadow-lg flex items-center justify-center"
            style={{
              boxShadow: '0 4px 10px rgba(251, 191, 36, 0.3), 0 0 15px rgba(251, 191, 36, 0.2)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}
          >
            <span className="tracking-wider">CLOSE</span>
          </button>
        </div>
      </div>
    );
  }

  // Futuristic card design
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-90 backdrop-blur-md flex items-center justify-center p-4">
      {/* Tech pattern background */}
      <div className="absolute inset-0 tech-pattern opacity-20"></div>

      <div
        ref={modalRef}
        className="relative max-w-xs w-full mx-auto overflow-hidden futuristic-card"
      >
        {/* Glowing border effect */}
        <div className="glow-border rounded-xl">
          <div className="glass-effect bg-gradient-to-br from-[#0a1128] via-[#1e3a8a] to-[#1e40af] text-white rounded-xl shadow-2xl overflow-hidden relative">

            {/* Decorative tech elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-cyan-400 via-transparent to-transparent opacity-50"></div>
              <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-transparent to-purple-500 opacity-50"></div>

              <div className="absolute top-10 right-10 w-20 h-20 rounded-full border border-cyan-500/20 opacity-20"></div>
              <div className="absolute bottom-20 left-5 w-16 h-16 rounded-full border border-purple-500/20 opacity-20"></div>

              <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
              <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-blue-800/50 transition-all duration-200 z-10 backdrop-blur-sm bg-black/20"
              aria-label="Close"
              style={{boxShadow: '0 0 10px rgba(0,0,0,0.2)'}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Profile content */}
            <div className="flex flex-col items-center pt-10 pb-8 px-2 relative">
              {/* Profile image with glowing effect */}
              <div className="relative mb-6" style={{animation: 'float 4s ease-in-out infinite'}}>
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-cyan-400/80 mx-auto shadow-lg"
                  style={{
                    boxShadow: '0 0 15px rgba(34, 211, 238, 0.4), inset 0 0 15px rgba(34, 211, 238, 0.4)',
                    padding: '3px'
                  }}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900 p-0.5">
                    <img
                      src={getProfileImageUrl(developer.profilePicture)}
                      alt={developer.name}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        console.log('Developer image error, using fallback');
                        e.target.onerror = null;
                        e.target.src = 'https://res.cloudinary.com/daf99zan2/image/upload/v1746966715/gpc-itarsi/profiles/profilePicture-1746966715084-977581870.webp';
                      }}
                    />
                  </div>
                </div>

                {/* Futuristic badge */}
                <div
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold shadow-lg border border-white/50"
                  style={{
                    animation: 'pulse 2s infinite',
                    boxShadow: '0 0 15px rgba(255, 87, 34, 0.5), inset 0 0 5px rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <span className="text-sm font-bold tracking-wider">AM</span>
                </div>

                {/* Decorative rings */}
                <div className="absolute inset-0 w-28 h-28 rounded-full border border-cyan-400/30 opacity-50" style={{animation: 'pulse 3s infinite'}}></div>
                <div className="absolute inset-0 w-28 h-28 rounded-full border border-purple-500/20 opacity-30" style={{animation: 'pulse 4s infinite 1s'}}></div>
              </div>

              {/* Name and title with glowing effect */}
              <div className="text-center mb-5">
                <h3 className="text-2xl font-bold text-white mb-1 tracking-wide" style={{textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'}}>
                  {developer.name}
                </h3>
                <p className="text-cyan-200 text-sm font-medium tracking-wider uppercase" style={{letterSpacing: '0.1em'}}>
                  {developer.title}
                </p>

                {/* Decorative line */}
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mt-3"></div>
              </div>

              {/* Bio section with futuristic styling */}
              <div className="px-6 w-full mb-7">
                <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-4 rounded-lg backdrop-blur-sm border border-white/10"
                  style={{boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)'}}>
                  <p className="text-white/90 text-sm text-center leading-relaxed">
                    {developer.bio?.length > 100 ? `${developer.bio.substring(0, 100)}...` : developer.bio}
                  </p>
                </div>
              </div>

              {/* Social media icons with neon glow effect */}
              <div className="flex justify-center space-x-5 mb-7 px-6 w-full">
                {/* GitHub */}
                <a
                  href="https://github.com/anmolmalviya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon bg-gradient-to-br from-gray-800 to-gray-900 p-2.5 rounded-full transform transition-all duration-300"
                  style={{boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'}}
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/in/anmolmalviya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon bg-gradient-to-br from-blue-600 to-blue-800 p-2.5 rounded-full transform transition-all duration-300"
                  style={{boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'}}
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com/anmolmalviya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon bg-gradient-to-br from-pink-500 to-purple-600 p-2.5 rounded-full transform transition-all duration-300"
                  style={{boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'}}
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>

                {/* Twitter */}
                <a
                  href="https://twitter.com/anmolmalviya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon bg-gradient-to-br from-blue-400 to-blue-600 p-2.5 rounded-full transform transition-all duration-300"
                  style={{boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'}}
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>

              {/* Futuristic contact button */}
              <div className="px-8 w-full mb-4">
                <a
                  href={`mailto:${developer.socialLinks?.email || 'anmolmalviya4328@gmail.com'}`}
                  className="futuristic-button flex items-center justify-center w-full px-4 py-3.5 bg-gradient-to-r from-orange-500 to-pink-600 rounded-md text-white font-medium shadow-lg"
                  style={{
                    boxShadow: '0 4px 10px rgba(255, 87, 34, 0.3), 0 0 15px rgba(255, 87, 34, 0.2)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="tracking-wider">CONTACT ME</span>
                </a>
              </div>

              {/* Developer Panel button removed */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperCard;
