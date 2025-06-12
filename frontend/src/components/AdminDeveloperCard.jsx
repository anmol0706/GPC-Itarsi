import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { getProfileImageUrl, handleImageError } from '../utils/imageUtils';
import { Link } from 'react-router-dom';

const AdminDeveloperCard = () => {
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeveloperData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${config.apiUrl}/api/developer/profile-public`);
        if (response.data) {
          setDeveloper(response.data);
        }
      } catch (err) {
        console.error('Error fetching developer data:', err);
        setError('Failed to load developer information');
        // Set default developer data if API fails
        setDeveloper({
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
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeveloperData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 flex items-center justify-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary-800 to-primary-900 rounded-lg shadow-lg overflow-hidden border border-primary-700/50">
      {/* Tech-inspired header pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute inset-0 bg-grid-white/10"></div>
      </div>

      <div className="relative p-4 flex items-center">
        <div className="flex-shrink-0 mr-4">
          <div className="w-16 h-16 rounded-full border-2 border-accent-400 overflow-hidden shadow-lg bg-primary-900/50 p-0.5">
            <img
              src={getProfileImageUrl(developer?.profilePicture)}
              alt={developer?.name || 'Developer'}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                console.log('AdminDeveloperCard image error, using fallback');
                e.target.onerror = null;
                e.target.src = 'https://res.cloudinary.com/daf99zan2/image/upload/v1746966715/gpc-itarsi/profiles/profilePicture-1746966715084-977581870.webp';
              }}
            />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{developer?.name || 'Developer'}</h3>
          <p className="text-accent-300 text-sm">{developer?.title || 'Web Developer'}</p>
          <div className="mt-2 flex space-x-3">
            {developer?.socialLinks?.github && (
              <a
                href={developer.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-700 p-2 rounded hover:bg-accent-600 transition-all duration-300 transform hover:scale-110 shadow-md"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            )}
            {developer?.socialLinks?.portfolio && (
              <a
                href={developer.socialLinks.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-700 p-2 rounded hover:bg-accent-600 transition-all duration-300 transform hover:scale-110 shadow-md"
                aria-label="Portfolio"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                </svg>
              </a>
            )}
            {developer?.socialLinks?.linkedin && (
              <a
                href={developer.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-700 p-2 rounded hover:bg-accent-600 transition-all duration-300 transform hover:scale-110 shadow-md"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            )}
            {developer?.socialLinks?.instagram && (
              <a
                href={developer.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-700 p-2 rounded hover:bg-accent-600 transition-all duration-300 transform hover:scale-110 shadow-md"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            )}
            {developer?.socialLinks?.twitter && (
              <a
                href={developer.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-700 p-2 rounded hover:bg-accent-600 transition-all duration-300 transform hover:scale-110 shadow-md"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            )}
            {developer?.socialLinks?.email && (
              <a
                href={`mailto:${developer.socialLinks.email}`}
                className="bg-accent-700 p-2 rounded hover:bg-accent-600 transition-all duration-300 transform hover:scale-110 shadow-md"
                aria-label="Email"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </a>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 ml-2">
          <Link
            to="/developer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 border border-accent-400 text-xs font-medium rounded-md text-white bg-accent-600 hover:bg-accent-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Developer Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDeveloperCard;
