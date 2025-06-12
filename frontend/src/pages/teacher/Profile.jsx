import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { getProfileImageUrl } from '../../utils/imageUtils';
import config from '../../config';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { isEqual } from 'lodash';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    qualification: '',
    experience: '',
    subjects: [],
    bio: ''
  });
  const [originalFormData, setOriginalFormData] = useState(null);
  const [isFormModified, setIsFormModified] = useState(false);
  const saveButtonRef = useRef(null);
  const lastSubmitTime = useRef(0);
  const isSaveInProgress = useRef(false);
  const fetchRequestId = useRef(0);
  const lastFetchTime = useRef(0);
  const profileDataVersion = useRef(0);

  // Reset state on component mount
  useEffect(() => {
    console.log('Component mounted - resetting state');

    // Reset all state
    setIsEditing(false);
    setIsFormModified(false);
    setError(null);
    setSuccess('');

    // Ensure we're not in a loading state on mount
    setLoading(false);

    // Reset all operation flags
    isSaveInProgress.current = false;
    lastSubmitTime.current = 0;
    fetchRequestId.current = 0;
    lastFetchTime.current = 0;
    profileDataVersion.current = 0;

    // Create an abort controller for cleanup
    const controller = new AbortController();

    // Return cleanup function
    return () => {
      console.log('Component unmounting - cleaning up');

      // Abort any in-flight requests
      controller.abort();

      // Reset all flags on unmount to prevent issues on remount
      isSaveInProgress.current = false;
      fetchRequestId.current = 0;
    };
  }, []);

  // Fetch teacher profile data only when the component mounts or user changes
  useEffect(() => {
    if (user) {
      // Throttle API calls - don't fetch more than once every 5 seconds
      const now = Date.now();
      if (now - lastFetchTime.current < 5000) {
        console.log('Throttling profile fetch - last fetch was less than 5 seconds ago');
        return;
      }

      // Update last fetch time
      lastFetchTime.current = now;

      // Increment request ID to track the latest request
      fetchRequestId.current += 1;
      const currentRequestId = fetchRequestId.current;

      console.log(`Initiating profile fetch with request ID: ${currentRequestId}`);
      fetchTeacherProfile(currentRequestId);
    }
  }, [user]); // Only depend on user, not on any state that might change during normal component operation

  // Handle entering edit mode - reset form data to original values
  const enterEditMode = useCallback(() => {
    console.log('Entering edit mode');

    // Reset any previous errors or success messages
    setError(null);
    setSuccess('');

    // First set the form data to match the original data
    if (originalFormData) {
      console.log('Setting form data to original values:', originalFormData);
      setFormData({...originalFormData});
    } else {
      console.warn('Original form data is not available, cannot reset form');
    }

    // Then set editing mode to true
    setIsFormModified(false);
    setIsEditing(true);

    // Reset save operation flags
    isSaveInProgress.current = false;

    console.log('Edit mode activated');
  }, [originalFormData]);

  // Handle exiting edit mode without saving
  const cancelEditing = useCallback(() => {
    console.log('Canceling edit mode');

    // Reset any previous errors or success messages
    setError(null);
    setSuccess('');

    // Reset form data to original values
    if (originalFormData) {
      console.log('Resetting form data to original values');
      setFormData({...originalFormData});
    } else {
      console.warn('Original form data is not available, cannot reset form');
    }

    // Exit edit mode
    setIsFormModified(false);
    setIsEditing(false);

    // Reset save operation flags
    isSaveInProgress.current = false;

    console.log('Edit mode canceled');
  }, [originalFormData]);

  // Validate form data
  const validateForm = useCallback((data) => {
    // Clear any existing errors
    setError(null);

    // Required fields validation
    if (!data.name || data.name.trim() === '') {
      setError('Full Name is required');
      return false;
    }

    if (!data.department || data.department.trim() === '') {
      setError('Department is required');
      return false;
    }

    if (!data.qualification || data.qualification.trim() === '') {
      setError('Qualification is required to complete your profile');
      return false;
    }

    if (!data.experience || data.experience.trim() === '') {
      setError('Experience is required to complete your profile');
      return false;
    }

    // Email validation if provided
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation if provided (simple format check)
    if (data.phone && !/^[0-9+\-\s()]{10,15}$/.test(data.phone)) {
      setError('Please enter a valid phone number');
      return false;
    }

    return true;
  }, []);

  // Dedicated function for saving profile data
  const handleProfileSave = useCallback(async () => {
    console.log('handleProfileSave called');

    // Check if a save operation is already in progress
    if (isSaveInProgress.current) {
      console.log('Save operation already in progress, skipping duplicate call');
      return;
    }

    // Safety check to prevent auto-triggering on component mount
    if (!saveButtonRef.current) {
      console.log('Save button ref not available, likely auto-triggered');
      return;
    }

    // Double-check if we're in edit mode
    if (!isEditing) {
      console.log('Not in edit mode, skipping save');
      return;
    }

    // Double-check if there are changes to save
    if (!isFormModified) {
      console.log('No changes detected, skipping save');
      return;
    }

    // Prevent multiple rapid submissions (throttle to once per second)
    const now = Date.now();
    if (now - lastSubmitTime.current < 1000) {
      console.log('Save throttled, please wait');
      return;
    }

    // Set the flag to indicate a save operation is in progress
    isSaveInProgress.current = true;

    lastSubmitTime.current = now;

    // Validate form data before saving
    if (!validateForm(formData)) {
      console.log('Form validation failed');
      return;
    }

    // Create a controller for request timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      setLoading(true);
      setError(null);
      setSuccess('');

      const token = localStorage.getItem('token');

      console.log('Saving profile with data:', formData);

      const response = await axios.put(
        `${config.apiUrl}/api/teacher-profile/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          signal: controller.signal
        }
      );

      console.log('Profile update response:', response.data);

      // Update teacher data with the response
      const updatedTeacher = response.data.teacher;
      setTeacherData(updatedTeacher);

      // Update user profile in context to ensure data consistency
      // Only update specific fields that won't trigger a re-render of this component
      const minimalProfileUpdate = {
        profilePicture: updatedTeacher.profilePicture
      };

      if (JSON.stringify(user?.profilePicture) !== JSON.stringify(updatedTeacher.profilePicture)) {
        console.log('Updating profile picture in user context');
        updateProfile(minimalProfileUpdate);
      }

      // Show appropriate success message based on profile completion
      if (teacherData?.profileComplete === false && updatedTeacher.profileComplete === true) {
        setSuccess('Profile completed successfully! Thank you for providing your details.');
      } else {
        setSuccess('Profile updated successfully!');
      }

      // Exit edit mode
      setIsEditing(false);

      // Reset form modification state
      setIsFormModified(false);

      // Update original form data to match current data
      setOriginalFormData({...formData});

      // Don't automatically refresh the profile data after saving
      // This prevents potential save loops
      console.log('Profile updated successfully, not refreshing to prevent save loops');
    } catch (error) {
      console.error('Error updating profile:', error);

      // Handle timeout errors
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else {
        setError(
          error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          'Failed to update profile. Please try again.'
        );
      }
    } finally {
      // Always clear the timeout and reset loading state
      clearTimeout(timeoutId);
      setLoading(false);

      // Reset the save in progress flag
      isSaveInProgress.current = false;

      // Ensure the button is re-enabled
      if (saveButtonRef.current) {
        saveButtonRef.current.disabled = false;
      }

      console.log('Save operation completed, flags reset');
    }
  }, [formData, isFormModified, isEditing, teacherData, updateProfile, validateForm]);

  // Handle save button click - this is the ONLY place where profile save should be called
  const handleSaveClick = useCallback((e) => {
    if (e) {
      e.preventDefault(); // Prevent default form submission
    }
    console.log('Save button clicked');

    // Prevent multiple rapid clicks (debounce)
    if (saveButtonRef.current) {
      saveButtonRef.current.disabled = true;

      // Re-enable after a short delay to prevent accidental double-clicks
      setTimeout(() => {
        if (saveButtonRef.current) {
          saveButtonRef.current.disabled = false;
        }
      }, 2000); // 2 seconds debounce
    }

    // Only proceed if in edit mode, there are actual changes, and not already loading
    if (isEditing && isFormModified && !loading) {
      console.log('Proceeding with save');
      handleProfileSave();
    } else {
      console.log('Save button clicked but not in edit mode, form not modified, or already loading');
    }
  }, [isEditing, isFormModified, loading, handleProfileSave]);

  const fetchTeacherProfile = async (requestId) => {
    // Skip if no request ID provided (should never happen)
    if (!requestId) {
      console.warn('No request ID provided for fetchTeacherProfile, skipping');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Reset save operation flags
      isSaveInProgress.current = false;

      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      console.log(`Fetching teacher profile data (request ID: ${requestId})...`);

      // Create a controller for request cancellation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await axios.get(`${config.apiUrl}/api/teachers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        signal: controller.signal
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      // Check if this is still the latest request
      if (requestId !== fetchRequestId.current) {
        console.log(`Ignoring response for outdated request ID: ${requestId}, current is: ${fetchRequestId.current}`);
        return;
      }

      console.log(`Teacher profile data received (request ID: ${requestId}):`, response.data);

      // Check if the data has actually changed by comparing with a hash or version
      const dataHash = JSON.stringify(response.data);
      const newVersion = dataHash.length; // Simple "version" based on data size

      if (newVersion === profileDataVersion.current) {
        console.log('Profile data unchanged, skipping update');
        setLoading(false);
        return;
      }

      // Update the version
      profileDataVersion.current = newVersion;

      // Update the teacher data state
      setTeacherData(response.data);

      // Create form data object with default values for all fields
      const newFormData = {
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        department: response.data.department || '',
        qualification: response.data.qualification || '',
        experience: response.data.experience || '',
        subjects: Array.isArray(response.data.subjects) ? [...response.data.subjects] : [],
        bio: response.data.bio || ''
      };

      console.log('Setting up form data:', newFormData);

      // Update the form data
      setFormData(newFormData);

      // Create a deep copy for the original form data to ensure they're separate objects
      const originalFormDataCopy = JSON.parse(JSON.stringify(newFormData));

      // Store the original form data for comparison
      setOriginalFormData(originalFormDataCopy);

      // Reset form modification state
      setIsFormModified(false);

      // Exit edit mode if we were in it
      setIsEditing(false);

      // Update the user context with the latest teacher data
      // This ensures the data is available throughout the application
      // IMPORTANT: We're disabling this to prevent circular updates
      // updateProfile(response.data);

      // Instead, only update specific fields that won't trigger a re-render of this component
      const minimalProfileUpdate = {
        profilePicture: response.data.profilePicture
      };

      if (JSON.stringify(user?.profilePicture) !== JSON.stringify(response.data.profilePicture)) {
        console.log('Updating profile picture in user context');
        updateProfile(minimalProfileUpdate);
      }

      // If profile is not complete, show a notification but don't automatically enter edit mode
      // This prevents the auto-save loop
      if (response.data.profileComplete === false) {
        console.log('Profile is incomplete, but not automatically entering edit mode');
        // We'll show a notification instead in the UI
      }

      setLoading(false);
    } catch (error) {
      // Check if this is still the latest request
      if (requestId !== fetchRequestId.current) {
        console.log(`Ignoring error for outdated request ID: ${requestId}, current is: ${fetchRequestId.current}`);
        return;
      }

      console.error(`Error fetching teacher profile (request ID: ${requestId}):`, error);

      // Only set error for network issues, not for aborted requests
      if (error.name !== 'AbortError' && error.code !== 'ECONNABORTED') {
        setError(error.response?.data?.message || 'Failed to load profile');
      }

      setLoading(false);

      // Reset save operation flags on error
      isSaveInProgress.current = false;
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
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

      const token = localStorage.getItem('token');

      await axios.post(
        `${config.apiUrl}/api/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Reset form and close modal
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowChangePasswordModal(false);

      setSuccess('Password changed successfully!');
      setLoading(false);
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.message || 'Failed to change password');
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    console.log('Image failed to load, using default image');
    e.target.src = '/images/default-profile.png'; // Fallback to default image
  };

  const handleUpdateProfilePicture = async () => {
    if (!profileImage) {
      setError('Please select an image to upload');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess('');

      const token = localStorage.getItem('token');

      const formData = new FormData();
      formData.append('profilePicture', profileImage);

      console.log('Uploading profile picture...');
      const response = await axios.put(
        `${config.apiUrl}/api/teacher-profile/update-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Profile picture update response:', response.data);

      // Update user profile in context with the new profile picture
      // Only update if the profile picture has actually changed
      if (JSON.stringify(user?.profilePicture) !== JSON.stringify(response.data.profilePicture)) {
        console.log('Updating profile picture in user context');
        updateProfile({ profilePicture: response.data.profilePicture });
      }

      setSuccess('Profile picture updated successfully!');
      setProfileImage(null);
      setPreviewUrl('');
      setLoading(false);

      // Don't automatically refresh the profile data after updating picture
      // This prevents potential save loops
      console.log('Profile picture updated successfully, not refreshing to prevent save loops');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      setError(error.response?.data?.message || 'Failed to update profile picture');
      setLoading(false);
    }
  };



  // Check if form data has been modified from original
  const checkFormModified = useCallback(() => {
    if (!originalFormData) {
      console.warn('Original form data is not available, cannot check for modifications');
      return false;
    }

    // Deep comparison using lodash isEqual
    const isModified = !isEqual(formData, originalFormData);

    // Only log when the modification state changes to avoid console spam
    if (isModified !== isFormModified) {
      console.log('Form modification check:', isModified);
      if (isModified) {
        console.log('Changes detected:', {
          name: formData.name !== originalFormData.name ?
            { original: originalFormData.name, new: formData.name } : 'unchanged',
          email: formData.email !== originalFormData.email ?
            { original: originalFormData.email, new: formData.email } : 'unchanged',
          phone: formData.phone !== originalFormData.phone ?
            { original: originalFormData.phone, new: formData.phone } : 'unchanged',
          department: formData.department !== originalFormData.department ?
            { original: originalFormData.department, new: formData.department } : 'unchanged',
          qualification: formData.qualification !== originalFormData.qualification ?
            { original: originalFormData.qualification, new: formData.qualification } : 'unchanged',
          experience: formData.experience !== originalFormData.experience ?
            { original: originalFormData.experience, new: formData.experience } : 'unchanged',
          bio: formData.bio !== originalFormData.bio ?
            { original: originalFormData.bio, new: formData.bio } : 'unchanged',
          subjects: !isEqual(formData.subjects, originalFormData.subjects) ?
            { original: originalFormData.subjects, new: formData.subjects } : 'unchanged'
        });
      }
      setIsFormModified(isModified);
    }

    return isModified;
  }, [formData, originalFormData, isFormModified]);

  // Update form modification state whenever form data changes
  // Use a debounced version to prevent too many checks
  useEffect(() => {
    if (!isEditing) return;

    // Debounce the check to avoid excessive processing
    const timeoutId = setTimeout(() => {
      checkFormModified();
    }, 300); // 300ms debounce

    // Clean up the timeout on unmount or when dependencies change
    return () => clearTimeout(timeoutId);
  }, [formData, isEditing, checkFormModified]);

  // Handle form field changes
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;

    // Only update if the value has actually changed
    if (formData[name] === value) {
      return;
    }

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }

    // Update the form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, [formData, error]);

  // Handle subjects field changes
  const handleSubjectsChange = useCallback((e) => {
    const subjectsArray = e.target.value
      ? e.target.value.split(',').map(subject => subject.trim())
      : [];

    // Check if subjects have actually changed
    const currentSubjectsStr = formData.subjects.join(', ');
    if (currentSubjectsStr === e.target.value) {
      return;
    }

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }

    // Update the form data
    setFormData(prev => ({
      ...prev,
      subjects: subjectsArray
    }));
  }, [formData, error]);



  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Teacher Profile</h1>

      {error && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative
          animate-pulse shadow-lg transition-all duration-500"
          style={{
            boxShadow: '0 0 15px rgba(255, 0, 0, 0.3)',
            background: 'linear-gradient(to right, rgba(254, 226, 226, 0.9), rgba(254, 202, 202, 0.9))'
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative
          shadow-lg transition-all duration-500"
          style={{
            boxShadow: '0 0 15px rgba(0, 255, 0, 0.3)',
            background: 'linear-gradient(to right, rgba(209, 250, 229, 0.9), rgba(167, 243, 208, 0.9))'
          }}
        >
          {success}
        </div>
      )}

      {/* Profile Completion Notification */}
      {teacherData && teacherData.profileComplete === false && (
        <div className="mt-6 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded relative
          shadow-lg transition-all duration-500"
          style={{
            boxShadow: '0 0 15px rgba(0, 0, 255, 0.2)',
            background: 'linear-gradient(to right, rgba(219, 234, 254, 0.9), rgba(191, 219, 254, 0.9))'
          }}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                Welcome! Your profile is incomplete. Please click the "Edit Profile" button to complete your profile by filling in your qualification, experience, and other details.
              </p>
              {!isEditing && (
                <button
                  onClick={enterEditMode}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && !teacherData ? (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-r-2 border-green-500"
            style={{
              boxShadow: '0 0 15px rgba(0, 255, 0, 0.3)',
              background: 'radial-gradient(circle, rgba(209, 250, 229, 0.1), transparent)'
            }}
          ></div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Picture */}
          <div className="bg-white shadow-lg overflow-hidden sm:rounded-lg transition-all duration-300 hover:shadow-xl"
            style={{
              background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
              boxShadow: '0 0 15px rgba(0, 200, 0, 0.1)'
            }}
          >
            <div className="px-4 py-5 sm:px-6 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-100 transition-all duration-300 hover:border-green-200"
                style={{
                  boxShadow: '0 0 20px rgba(0, 200, 0, 0.2)'
                }}
              >
                <img
                  src={previewUrl || getProfileImageUrl(user?.profilePicture)}
                  alt="Profile"
                  className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                  onError={handleImageError}
                />
              </div>
              <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">{teacherData?.name}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">{user?.username}</p>

              <div className="mt-6 w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Update Profile Picture
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-green-200 border-dashed rounded-md
                  transition-all duration-300 hover:border-green-300 bg-gradient-to-b from-white to-green-50"
                  style={{
                    boxShadow: '0 0 10px rgba(0, 200, 0, 0.1)'
                  }}
                >
                  <div className="space-y-1 text-center">
                    {previewUrl ? (
                      <div className="mb-3">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="mx-auto h-32 w-32 rounded-full object-cover border-2 border-green-200"
                          style={{
                            boxShadow: '0 0 15px rgba(0, 200, 0, 0.2)'
                          }}
                        />
                      </div>
                    ) : (
                      <svg
                        className="mx-auto h-12 w-12 text-green-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="profile-image"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500
                        focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500
                        transition-all duration-300 hover:bg-green-50 px-2 py-1"
                      >
                        <span>Upload a file</span>
                        <input
                          id="profile-image"
                          name="profile-image"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1 py-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateProfilePicture}
                  disabled={!profileImage || loading}
                  className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white
                  bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600
                  transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  style={{
                    boxShadow: '0 0 15px rgba(0, 255, 0, 0.2)',
                    textShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {loading ? 'Updating...' : 'Update Picture'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowChangePasswordModal(true)}
                className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md
                text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 transform hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                style={{
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)'
                }}
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 bg-white shadow-lg overflow-hidden sm:rounded-lg transition-all duration-300 hover:shadow-xl"
            style={{
              background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
              boxShadow: '0 0 15px rgba(0, 200, 0, 0.1)'
            }}
          >
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Teacher Information</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and subjects.</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={enterEditMode}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                  bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600
                  transition-all duration-300 transform hover:scale-105
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  style={{
                    boxShadow: '0 0 15px rgba(0, 255, 0, 0.3)',
                    textShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <FaEdit className="mr-2 animate-pulse" /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={cancelEditing}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium
                  text-gray-700 bg-white hover:bg-gray-50
                  transition-all duration-300 transform hover:scale-105
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaTimes className="mr-2" /> Cancel
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{teacherData?.name}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Username</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.username}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{teacherData?.email || 'Not provided'}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{teacherData?.phone || 'Not provided'}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Department</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{teacherData?.department}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Qualification</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{teacherData?.qualification || 'Not provided'}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Experience</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{teacherData?.experience || 'Not provided'}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Teacher</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Subjects</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {teacherData?.subjects && teacherData.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacherData.subjects.map((subject, index) => (
                            <span key={index} className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                              {subject}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'No subjects assigned'
                      )}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Bio</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {teacherData?.bio || 'No bio provided'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Study Materials</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {teacherData?.studyMaterials?.length || 0} materials uploaded
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="border-t border-gray-200 p-4 bg-gradient-to-b from-gray-50 to-white">
                <div
                  id="edit-profile-form"
                  className="profile-form-container"
                >
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="col-span-1 sm:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleFormChange}
                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm
                        border-gray-300 rounded-md bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm
                        transition-all duration-300 hover:shadow-md focus:shadow-lg"
                        style={{
                          boxShadow: '0 0 5px rgba(0, 200, 0, 0.1)',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm
                        border-gray-300 rounded-md bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm
                        transition-all duration-300 hover:shadow-md focus:shadow-lg"
                        style={{
                          boxShadow: '0 0 5px rgba(0, 200, 0, 0.1)',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm
                        border-gray-300 rounded-md bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm
                        transition-all duration-300 hover:shadow-md focus:shadow-lg"
                        style={{
                          boxShadow: '0 0 5px rgba(0, 200, 0, 0.1)',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                        Department *
                      </label>
                      <input
                        type="text"
                        name="department"
                        id="department"
                        required
                        value={formData.department}
                        onChange={handleFormChange}
                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm
                        border-gray-300 rounded-md bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm
                        transition-all duration-300 hover:shadow-md focus:shadow-lg"
                        style={{
                          boxShadow: '0 0 5px rgba(0, 200, 0, 0.1)',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">
                        Qualification
                      </label>
                      <input
                        type="text"
                        name="qualification"
                        id="qualification"
                        value={formData.qualification}
                        onChange={handleFormChange}
                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm
                        border-gray-300 rounded-md bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm
                        transition-all duration-300 hover:shadow-md focus:shadow-lg"
                        style={{
                          boxShadow: '0 0 5px rgba(0, 200, 0, 0.1)',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                        Experience
                      </label>
                      <input
                        type="text"
                        name="experience"
                        id="experience"
                        value={formData.experience}
                        onChange={handleFormChange}
                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm
                        border-gray-300 rounded-md bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm
                        transition-all duration-300 hover:shadow-md focus:shadow-lg"
                        style={{
                          boxShadow: '0 0 5px rgba(0, 200, 0, 0.1)',
                        }}
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label htmlFor="subjects" className="block text-sm font-medium text-gray-700">
                        Subjects (comma separated)
                      </label>
                      <input
                        type="text"
                        name="subjects"
                        id="subjects"
                        value={formData.subjects.join(', ')}
                        onChange={handleSubjectsChange}
                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm
                        border-gray-300 rounded-md bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm
                        transition-all duration-300 hover:shadow-md focus:shadow-lg"
                        style={{
                          boxShadow: '0 0 5px rgba(0, 200, 0, 0.1)',
                        }}
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        id="bio"
                        rows="4"
                        value={formData.bio}
                        onChange={handleFormChange}
                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm
                        border-gray-300 rounded-md bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm
                        transition-all duration-300 hover:shadow-md focus:shadow-lg"
                        style={{
                          boxShadow: '0 0 5px rgba(0, 200, 0, 0.1)',
                        }}
                      ></textarea>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveClick}
                      ref={saveButtonRef}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                      transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                      ${loading
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 cursor-wait'
                        : isFormModified
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover:scale-105 active:from-green-700 active:to-blue-700'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'}`}
                      style={{
                        boxShadow: loading
                          ? '0 0 15px rgba(255, 165, 0, 0.5)'
                          : isFormModified
                            ? '0 0 15px rgba(0, 255, 0, 0.3)'
                            : 'none',
                        textShadow: isFormModified ? '0 0 5px rgba(255, 255, 255, 0.5)' : 'none',
                        opacity: isFormModified || loading ? '1' : '0.7',
                      }}
                      disabled={loading || !isFormModified || !isEditing}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className={`mr-2 ${isFormModified ? 'animate-pulse' : ''}`} />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-filter backdrop-blur-sm"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full
              animate-fadeIn"
              style={{
                boxShadow: '0 0 25px rgba(0, 200, 0, 0.3)',
                background: 'linear-gradient(to bottom, #ffffff, #f9fafb)'
              }}
            >
              <form onSubmit={handleChangePassword}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Change Password</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            id="currentPassword"
                            required
                            className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm
                            border-gray-300 rounded-md bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm
                            transition-all duration-300 hover:shadow-md focus:shadow-lg"
                            style={{
                              boxShadow: '0 0 5px rgba(0, 200, 0, 0.1)',
                            }}
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            required
                            className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm
                            border-gray-300 rounded-md bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm
                            transition-all duration-300 hover:shadow-md focus:shadow-lg"
                            style={{
                              boxShadow: '0 0 5px rgba(0, 200, 0, 0.1)',
                            }}
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            required
                            className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm
                            border-gray-300 rounded-md bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm
                            transition-all duration-300 hover:shadow-md focus:shadow-lg"
                            style={{
                              boxShadow: '0 0 5px rgba(0, 200, 0, 0.1)',
                            }}
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2
                    bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600
                    text-base font-medium text-white transition-all duration-300 transform hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    style={{
                      boxShadow: '0 0 15px rgba(0, 255, 0, 0.2)',
                      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2
                    bg-white text-base font-medium text-gray-700 hover:bg-gray-50
                    transition-all duration-300 transform hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setShowChangePasswordModal(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
