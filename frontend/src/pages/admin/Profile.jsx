import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { getProfileImageUrl, handleImageError } from '../../utils/imageUtils';
import config from '../../config';
import { Switch } from '@headlessui/react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [useCloudinary, setUseCloudinary] = useState(true); // Set to true by default since Cloudinary is now configured correctly

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch admin profile data on component mount
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        console.log('Fetching admin profile data...');
        console.log('User from context:', user);

        const response = await axios.get(`${config.apiUrl}/api/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Admin profile data received:', response.data);

        const profileData = response.data;
        setProfileData({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          bio: profileData.bio || ''
        });

        // Only update user context if there are actual changes
        if (JSON.stringify(user) !== JSON.stringify(profileData)) {
          console.log('Updating user context with profile data');
          updateProfile(profileData);
        }

      } catch (err) {
        console.error('Error fetching admin profile:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load profile. Please try again.');

        // Fallback to user context data if API call fails
        if (user) {
          console.log('Falling back to user context data');
          setProfileData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            bio: user.bio || ''
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
    // Remove updateProfile from dependency array to prevent infinite loop
  }, []);

  // Also set profile data from user context when it changes
  useEffect(() => {
    if (user && !loading) {
      console.log('User context changed, checking if profile data needs update');
      console.log('Current user data:', {
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio
      });
      console.log('Current profile data:', profileData);

      // Only update if the user data is different from current profile data
      const shouldUpdate =
        user.name !== profileData.name ||
        user.email !== profileData.email ||
        user.phone !== profileData.phone ||
        user.bio !== profileData.bio;

      if (shouldUpdate) {
        console.log('Updating profile data from user context');
        setProfileData(prevData => {
          const newData = {
            ...prevData,
            name: user.name || prevData.name || '',
            email: user.email || prevData.email || '',
            phone: user.phone || prevData.phone || '',
            bio: user.bio || prevData.bio || ''
          };
          console.log('New profile data:', newData);
          return newData;
        });
      } else {
        console.log('No update needed for profile data');
      }
    }
  }, [user, loading]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Validate form data
      if (!profileData.name || profileData.name.trim() === '') {
        setError('Name is required');
        setLoading(false);
        return;
      }

      console.log('Submitting profile data:', profileData);
      console.log('User ID from context:', user?.id);
      console.log('User object from context:', user);

      // Update user context with form data immediately to provide feedback
      const updatedUserData = {
        ...user,
        name: profileData.name,
        email: profileData.email || user?.email || '',
        phone: profileData.phone || user?.phone || '',
        bio: profileData.bio || user?.bio || ''
      };

      // Update the user context with the form data
      updateProfile(updatedUserData);

      // Show success message for the immediate update
      setSuccess('Profile data updated locally. Saving to server...');

      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('email', profileData.email || '');
      formData.append('phone', profileData.phone || '');
      formData.append('bio', profileData.bio || '');

      // Log form data for debugging
      console.log('Form data being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Check if profile image is valid before appending
      if (profileImage) {
        console.log('Profile image selected:', profileImage.name, profileImage.type, profileImage.size);

        // Validate file size (max 2MB)
        if (profileImage.size > 2 * 1024 * 1024) {
          setError('Profile image must be less than 2MB');
          setLoading(false);
          return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        if (!validTypes.includes(profileImage.type)) {
          setError('Profile image must be a valid image file (JPEG, PNG, or GIF)');
          setLoading(false);
          return;
        }

        formData.append('profilePicture', profileImage);
        console.log('Profile image appended to form data');

        // Set image preview for immediate feedback
        if (imagePreview) {
          updatedUserData.profilePicture = imagePreview;
          updateProfile(updatedUserData);
        }
      } else {
        console.log('No profile image selected');
      }

      // Determine which endpoint to use based on the Cloudinary toggle
      const endpoint = useCloudinary
        ? `${config.apiUrl}/api/admin/profile-cloudinary`
        : `${config.apiUrl}/api/admin/profile`;

      console.log(`Updating profile with ${useCloudinary ? 'Cloudinary' : 'local storage'} URL:`, endpoint);
      console.log('Authorization token:', `Bearer ${token.substring(0, 10)}...`);

      // Set a timeout to handle potential server issues
      const timeoutId = setTimeout(() => {
        if (loading) {
          setError('Request is taking too long. The server might be down or experiencing issues. Your profile has been updated locally.');
          setLoading(false);
        }
      }, 15000); // 15 seconds timeout

      try {
        console.log('Sending PUT request to:', endpoint);
        const response = await axios.put(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          timeout: 15000 // 15 seconds timeout
        });

        // Clear the timeout since we got a response
        clearTimeout(timeoutId);

        console.log('Profile update response:', response.data);

        // Update the user context with the server response
        updateProfile(response.data);

        setSuccess(`Profile updated successfully using ${useCloudinary ? 'Cloudinary' : 'local storage'}`);

        // Reset the profile image state after successful upload
        setProfileImage(null);
        setImagePreview(null);
      } catch (serverError) {
        // Clear the timeout
        clearTimeout(timeoutId);

        console.error('Error updating profile on server:', serverError);

        // More detailed error handling
        if (serverError.response) {
          console.error('Error response data:', serverError.response.data);
          console.error('Error response status:', serverError.response.status);
          console.error('Error response headers:', serverError.response.headers);

          setError(`Failed to update profile on server: ${serverError.response.status} - ${serverError.response?.data?.message || serverError.response.statusText}. Your profile has been updated locally.`);
        } else if (serverError.request) {
          console.error('Error request:', serverError.request);
          setError('No response received from server. Your profile has been updated locally, but changes will not persist after logout.');
        } else if (serverError.code === 'ECONNABORTED') {
          setError('Request timed out. Your profile has been updated locally, but changes will not persist after logout.');
        } else {
          console.error('Error message:', serverError.message);
          setError(`Error: ${serverError.message}. Your profile has been updated locally, but changes will not persist after logout.`);
        }
      }
    } catch (error) {
      console.error('Error in profile update process:', error);
      setError(`An unexpected error occurred: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess('');

      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('Changing password with URL:', `${config.apiUrl}/api/admin/change-password`);

      const response = await axios.put(`${config.apiUrl}/api/admin/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Password change response:', response.data);
      setSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);

      // More detailed error handling
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);

        setError(`Failed to change password: ${error.response.status} - ${error.response?.data?.message || error.response.statusText}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('No response received from server. Please check your network connection.');
      } else {
        console.error('Error message:', error.message);
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-700 mb-8">My Profile</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          <span className="ml-2">Loading profile data...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-primary-700">Profile Information</h2>
            </div>
            <div className="border-t border-gray-200">
              <form onSubmit={handleProfileSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows="4"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-primary-500/30 shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>

                  <div className="mt-4 sm:mt-0 flex flex-col">
                    <div className="flex items-center">
                      <Switch
                        checked={useCloudinary}
                        onChange={setUseCloudinary}
                        className={`${
                          useCloudinary ? 'bg-primary-600' : 'bg-gray-300'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                      >
                        <span
                          className={`${
                            useCloudinary ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </Switch>
                      <span className="ml-2 text-sm text-gray-700">
                        {useCloudinary ? 'Using Cloudinary' : 'Using Local Storage'}
                      </span>
                    </div>
                    {useCloudinary && (
                      <div className="mt-2 text-xs text-green-600">
                        Cloudinary is configured correctly. Your images will be stored in the cloud.
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-xl font-semibold text-primary-700">Change Password</h2>
            </div>
            <div className="border-t border-gray-200">
              <form onSubmit={handleChangePassword} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-primary-500/30 shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden">
                <img
                  src={imagePreview || getProfileImageUrl(user?.profilePicture)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-primary-800">{user?.name || 'Admin User'}</h3>
                <p className="text-sm text-gray-500">{user?.role || 'Administrator'}</p>
              </div>
              <div className="mt-6 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
