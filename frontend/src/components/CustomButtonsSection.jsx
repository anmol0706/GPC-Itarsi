import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { TextReveal } from './animations';
import { LargeIconOptions } from './IconSelector';

const CustomButtonsSection = () => {
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchButtons = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.apiUrl}/api/custom-buttons`);

        // Filter active buttons and sort by displayOrder
        const activeButtons = response.data
          .filter(button => button.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);

        setButtons(activeButtons);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching custom buttons:', error);
        setError('Failed to load custom buttons');
        setLoading(false);
      }
    };

    fetchButtons();
  }, []);

  // If there are no active buttons, don't render the section
  if (!loading && buttons.length === 0) {
    return null;
  }

  return (
    <div className="relative py-16 overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary-500/20 text-primary-300 text-sm font-semibold mb-4 backdrop-blur-sm shadow-sm">
            Quick Links
          </div>
          <TextReveal className="mt-2 text-5xl font-extrabold text-white sm:text-4xl">
            Important <span className="text-accent-500">Links</span>
          </TextReveal>
          <div className="w-24 h-1.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full mx-auto mt-6"></div>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
            <p className="mt-2 text-gray-200">Loading links...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-300">{error}</div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            {buttons.map((button) => (
              <a
                key={button._id}
                href={button.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center px-6 py-5 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-b from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl min-w-[160px] gap-3"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-white/25 backdrop-blur-sm rounded-full p-2 shadow-inner border border-white/10">
                  {button.iconType && LargeIconOptions[button.iconType] ? (
                    LargeIconOptions[button.iconType]
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>
                <span className="text-center font-medium text-white/90">{button.title}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomButtonsSection;
