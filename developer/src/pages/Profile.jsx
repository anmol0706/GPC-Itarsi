import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from '../config';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    title: '',
    bio: '',
    education: '',
    experience: '',
    socialLinks: {
      github: '',
      portfolio: '',
      instagram: '',
      email: ''
    }
  });
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile data from backend without authentication
        try {
          console.log('Fetching profile from:', `${config.apiUrl}/api/developer/profile-public`);
          const response = await axios.get(`${config.apiUrl}/api/developer/profile-public`);
          console.log('Profile data received:', response.data);

          setProfileData({
            name: response.data.name || 'Developer',
            title: response.data.title || 'Web Developer',
            bio: response.data.bio || 'I am a web developer specializing in React and Node.js.',
            education: response.data.education || 'Computer Science',
            experience: response.data.experience || '5 years',
            socialLinks: response.data.socialLinks || {
              github: 'https://github.com/developer',
              portfolio: 'https://developer.com',
              instagram: 'https://instagram.com/developer',
              email: 'developer@example.com'
            }
          });

          if (response.data.profilePicture) {
            // Check if the profile picture is a Cloudinary URL or a local file
            if (response.data.profilePicture.includes('cloudinary') || response.data.profilePicture.startsWith('http')) {
              setPreviewImage(response.data.profilePicture);
            } else {
              setPreviewImage(`${config.apiUrl}/uploads/${response.data.profilePicture}`);
            }
          } else {
            setPreviewImage('https://ui-avatars.com/api/?name=Developer&background=0D8ABC&color=fff&size=200');
          }
        } catch (err) {
          console.error('Error fetching profile from API:', err);
          console.error('Error details:', err.response ? err.response.data : 'No response data');
          console.error('API URL used:', config.apiUrl);

          // Check if the error is "Developer not found"
          const isDeveloperNotFound =
            err.response &&
            err.response.data &&
            err.response.data.message === "Developer not found";

          // Use default data if API fails
          setProfileData({
            name: 'Developer',
            title: 'Web Developer',
            bio: 'I am a web developer specializing in React and Node.js.',
            education: 'Computer Science',
            experience: '5 years',
            socialLinks: {
              github: 'https://github.com/developer',
              portfolio: 'https://developer.com',
              instagram: 'https://instagram.com/developer',
              email: 'developer@example.com'
            }
          });
          setPreviewImage('https://ui-avatars.com/api/?name=Developer&background=0D8ABC&color=fff&size=200');

          // Set a more user-friendly error message
          if (isDeveloperNotFound) {
            setError('Could not load profile data from the server: Developer not found. Using default profile information instead. You can save this profile to create a developer user.');
          } else {
            setError('Could not load profile data from the server. Using default profile information instead.');
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error in fetchProfile:', err);
        setError('Failed to load profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Update profile data without authentication
      try {
        console.log('Updating profile data at:', `${config.apiUrl}/api/developer/profile-public`);
        console.log('Profile data being sent:', {
          name: profileData.name,
          title: profileData.title,
          bio: profileData.bio,
          education: profileData.education,
          experience: profileData.experience,
          socialLinks: JSON.stringify(profileData.socialLinks)
        });

        const response = await axios.put(
          `${config.apiUrl}/api/developer/profile-public`,
          {
            name: profileData.name,
            title: profileData.title,
            bio: profileData.bio,
            education: profileData.education,
            experience: profileData.experience,
            socialLinks: JSON.stringify(profileData.socialLinks)
          }
        );

        console.log('Profile update response:', response.data);

        // Update profile picture if a new one was selected
        if (fileInputRef.current.files[0]) {
          console.log('Uploading profile picture');
          const formData = new FormData();
          formData.append('profilePicture', fileInputRef.current.files[0]);

          const pictureResponse = await axios.put(
            `${config.apiUrl}/api/developer/profile-picture-public`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );

          console.log('Profile picture update response:', pictureResponse.data);

          // Update preview image with the new image URL if available
          if (pictureResponse.data.url) {
            setPreviewImage(pictureResponse.data.url);
          } else if (pictureResponse.data.path) {
            setPreviewImage(pictureResponse.data.path);
          } else if (pictureResponse.data.filename) {
            setPreviewImage(`${config.apiUrl}/uploads/${pictureResponse.data.filename}`);
          }
        }

        setSuccess('Profile updated successfully! Refresh the page to see your changes.');

        // Reload the page after a short delay to show the updated profile
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (err) {
        console.error('Error updating profile with API:', err);
        console.error('Error details:', err.response ? err.response.data : 'No response data');
        console.error('API URL used:', config.apiUrl);

        // Check if this might be a first-time save
        const isFirstTimeSave =
          err.response &&
          err.response.status === 404 &&
          err.response.data &&
          err.response.data.message === "Developer not found";

        if (isFirstTimeSave) {
          setError('This appears to be the first time you are saving a developer profile. ' +
                  'The backend needs to create a new developer user. Please try again, and if the issue persists, ' +
                  'contact the administrator to ensure the backend is properly configured.');
        } else {
          setError('Failed to update profile. Please try again later. Error: ' +
                  (err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : err.message || 'Unknown error'));
        }
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Failed to update profile. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-600 to-primary-800">
          <h3 className="text-lg leading-6 font-medium text-white">Developer Profile</h3>
          <p className="mt-1 max-w-2xl text-sm text-primary-200">
            Update your personal information and profile picture
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
                <div className="md:col-span-2">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary-100 shadow-lg mb-4">
                      <img
                        src={previewImage || 'https://ui-avatars.com/api/?name=Developer&background=0D8ABC&color=fff&size=200'}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      accept="image/*"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={profileData.title}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g. Full Stack Developer"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="A brief description about yourself"
                  />
                </div>

                <div>
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                    Education
                  </label>
                  <input
                    type="text"
                    name="education"
                    id="education"
                    value={profileData.education}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Your educational background"
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    name="experience"
                    id="experience"
                    value={profileData.experience}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Your professional experience"
                  />
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Social Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
                        GitHub
                      </label>
                      <input
                        type="text"
                        name="github"
                        id="github"
                        value={profileData.socialLinks.github}
                        onChange={handleSocialLinkChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>

                    <div>
                      <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-1">
                        Portfolio
                      </label>
                      <input
                        type="text"
                        name="portfolio"
                        id="portfolio"
                        value={profileData.socialLinks.portfolio}
                        onChange={handleSocialLinkChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://yourportfolio.com"
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
                        value={profileData.socialLinks.instagram}
                        onChange={handleSocialLinkChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://instagram.com/yourusername"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={profileData.socialLinks.email}
                        onChange={handleSocialLinkChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="your.email@example.com"
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

export default Profile;
