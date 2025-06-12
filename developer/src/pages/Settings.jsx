import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    siteName: 'Government Polytechnic College, Itarsi',
    siteDescription: 'Official website of Government Polytechnic College, Itarsi',
    contactEmail: 'contact@gpcitarsi.edu.in',
    contactPhone: '+91 1234567890',
    address: 'Government Polytechnic College, Itarsi, Madhya Pradesh, India',
    socialLinks: {
      facebook: 'https://facebook.com/gpcitarsi',
      twitter: 'https://twitter.com/gpcitarsi',
      instagram: 'https://instagram.com/gpcitarsi',
      youtube: 'https://youtube.com/gpcitarsi'
    },
    colors: {
      primary: '#0D47A1',
      secondary: '#1976D2',
      accent: '#2196F3'
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch settings data from backend
        try {
          console.log('Fetching settings from:', `${config.apiUrl}/api/settings`);
          const response = await axios.get(`${config.apiUrl}/api/settings`);
          console.log('Settings data received:', response.data);

          if (response.data) {
            setSettings(response.data);
          }
        } catch (err) {
          console.error('Error fetching settings from API:', err);
          console.error('Error details:', err.response ? err.response.data : 'No response data');

          // Keep default values if API fails
          setError('Could not load settings from the server. Using default settings instead.');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error in fetchSettings:', err);
        setError('Failed to load settings. Please try again later.');
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value
      }
    }));
  };

  const handleColorChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Update settings data
      try {
        console.log('Updating settings at:', `${config.apiUrl}/api/settings/public`);
        console.log('Settings data being sent:', settings);

        const response = await axios.put(
          `${config.apiUrl}/api/settings/public`,
          settings
        );

        console.log('Settings update response:', response.data);
        setSuccess('Settings updated successfully!');
      } catch (err) {
        console.error('Error updating settings with API:', err);
        console.error('Error details:', err.response ? err.response.data : 'No response data');

        setError('Failed to update settings. Please try again later.');
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Failed to update settings. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-600 to-primary-800">
          <h3 className="text-lg leading-6 font-medium text-white">Website Settings</h3>
          <p className="mt-1 max-w-2xl text-sm text-primary-200">
            Configure global settings for the website
          </p>
        </div>

        {loading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    name="siteName"
                    id="siteName"
                    value={settings.siteName}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Site Description
                  </label>
                  <input
                    type="text"
                    name="siteDescription"
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    id="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    name="contactPhone"
                    id="contactPhone"
                    value={settings.contactPhone}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={2}
                    value={settings.address}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="md:col-span-2 mt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Social Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                        Facebook
                      </label>
                      <input
                        type="text"
                        name="facebook"
                        id="facebook"
                        value={settings.socialLinks.facebook}
                        onChange={handleSocialLinkChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                        Twitter
                      </label>
                      <input
                        type="text"
                        name="twitter"
                        id="twitter"
                        value={settings.socialLinks.twitter}
                        onChange={handleSocialLinkChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                        Instagram
                      </label>
                      <input
                        type="text"
                        name="instagram"
                        id="instagram"
                        value={settings.socialLinks.instagram}
                        onChange={handleSocialLinkChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-1">
                        YouTube
                      </label>
                      <input
                        type="text"
                        name="youtube"
                        id="youtube"
                        value={settings.socialLinks.youtube}
                        onChange={handleSocialLinkChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;
