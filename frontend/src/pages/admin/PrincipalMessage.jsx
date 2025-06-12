import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from '../../config';
import { getProfileImageUrl, handleImageError } from '../../utils/imageUtils';
import Alert from '../../components/Alert';
import { showSuccessToast } from '../../utils/toastUtils';

const PrincipalMessage = () => {
  const [message, setMessage] = useState({
    name: '',
    title: '',
    message: '',
    image: 'default-principal.jpg'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPrincipalMessage();
  }, []);

  const fetchPrincipalMessage = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.apiUrl}/api/overview/principal-message`);

      if (response.data) {
        setMessage(response.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching principal message:', error);
      setError(error.response?.data?.message || 'Failed to load principal message');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMessage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('token');
      const formData = new FormData();

      // Log what we're sending to the server
      console.log('Submitting principal message update with data:', {
        name: message.name,
        title: message.title,
        message: message.message,
        hasImage: fileInputRef.current && fileInputRef.current.files.length > 0
      });

      formData.append('name', message.name);
      formData.append('title', message.title);
      formData.append('message', message.message);

      // Always use the admin route for principal message updates
      // This ensures Cloudinary is used for image uploads
      let apiUrl = `${config.apiUrl}/api/admin/principal-message`;

      // If there's a new image, append it
      if (fileInputRef.current && fileInputRef.current.files[0]) {
        const imageFile = fileInputRef.current.files[0];
        formData.append('image', imageFile);
        console.log('Uploading new principal image to Cloudinary:', {
          name: imageFile.name,
          type: imageFile.type,
          size: imageFile.size
        });
      }

      console.log('Sending request to:', apiUrl);

      const response = await axios.put(
        apiUrl,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Server response:', response.data);

      showSuccessToast('Principal message updated successfully');
      setSuccess('Principal message updated successfully');

      // Refresh the data
      fetchPrincipalMessage();
      setImagePreview(null);

      setSaving(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error updating principal message:', error);
      console.error('Error details:', error.response || error);
      setError(error.response?.data?.message || 'Failed to update principal message');
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Principal's Message</h1>

      {error && (
        <Alert
          type="error"
          message={error}
          dismissible={true}
          onDismiss={() => setError(null)}
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          dismissible={true}
          onDismiss={() => setSuccess('')}
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Principal's Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={message.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={message.title}
                  onChange={handleInputChange}
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={10}
                  value={message.message}
                  onChange={handleInputChange}
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Use line breaks for paragraphs. The message will be displayed as formatted.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Principal's Photo
              </label>
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 mb-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Principal preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={getProfileImageUrl(message.image)}
                      alt="Principal"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  )}
                </div>
                <label
                  htmlFor="image"
                  className="cursor-pointer px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Change Photo
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Recommended: Square image, at least 300x300 pixels
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PrincipalMessage;
