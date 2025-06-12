import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const OverviewEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mission: '',
    vision: '',
    principalName: '',
    principalDesignation: '',
    principalMessage: '',
    stats: [
      { label: 'Students', value: '' },
      { label: 'Faculty', value: '' },
      { label: 'Courses', value: '' },
      { label: 'Placement Rate', value: '' }
    ]
  });

  const [principalImage, setPrincipalImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.apiUrl}/api/overview`);
      const data = response.data;

      setFormData({
        title: data.title || '',
        content: data.content || '',
        mission: data.mission || '',
        vision: data.vision || '',
        principalName: data.principalName || '',
        principalDesignation: data.principalDesignation || '',
        principalMessage: data.principalMessage || '',
        stats: data.stats || [
          { label: 'Students', value: '' },
          { label: 'Faculty', value: '' },
          { label: 'Courses', value: '' },
          { label: 'Placement Rate', value: '' }
        ]
      });

      if (data.principalImage) {
        // Use the config.apiUrl from axios defaults
        setImagePreview(`${axios.defaults.baseURL}/uploads/profiles/${data.principalImage}`);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching overview data:', error);
      setError('Failed to load overview data');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatChange = (index, field, value) => {
    const updatedStats = [...formData.stats];
    updatedStats[index] = {
      ...updatedStats[index],
      [field]: value
    };

    setFormData(prev => ({
      ...prev,
      stats: updatedStats
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPrincipalImage(file);

      // Create preview
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
      setError('');
      setSuccess('');

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('mission', formData.mission);
      formDataToSend.append('vision', formData.vision);
      formDataToSend.append('principalName', formData.principalName);
      formDataToSend.append('principalDesignation', formData.principalDesignation);
      formDataToSend.append('principalMessage', formData.principalMessage);
      formDataToSend.append('stats', JSON.stringify(formData.stats));

      if (principalImage) {
        formDataToSend.append('principalImage', principalImage);
      }

      const response = await axios.put(`${config.apiUrl}/api/admin/update-overview`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSuccess('Overview updated successfully');
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (error) {
      console.error('Error updating overview:', error);
      setError(error.response?.data?.message || 'Failed to update overview');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-700 mb-8">
        Edit College Overview & Principal Information
      </h1>

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

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">College Overview</h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  College Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  College Description
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={4}
                  value={formData.content}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="mission" className="block text-sm font-medium text-gray-700">
                  Mission
                </label>
                <textarea
                  id="mission"
                  name="mission"
                  rows={3}
                  value={formData.mission}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="vision" className="block text-sm font-medium text-gray-700">
                  Vision
                </label>
                <textarea
                  id="vision"
                  name="vision"
                  rows={3}
                  value={formData.vision}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">College Statistics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {stat.label}
                  </label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Principal Information</h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="principalName" className="block text-sm font-medium text-gray-700">
                  Principal Name
                </label>
                <input
                  type="text"
                  id="principalName"
                  name="principalName"
                  value={formData.principalName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="principalDesignation" className="block text-sm font-medium text-gray-700">
                  Principal Designation
                </label>
                <input
                  type="text"
                  id="principalDesignation"
                  name="principalDesignation"
                  value={formData.principalDesignation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="principalMessage" className="block text-sm font-medium text-gray-700">
                  Principal's Message
                </label>
                <textarea
                  id="principalMessage"
                  name="principalMessage"
                  rows={5}
                  value={formData.principalMessage}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Principal's Image
                </label>
                <div className="mt-1 flex items-center space-x-6">
                  {imagePreview && (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Principal Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="principalImage"
                      name="principalImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Recommended: Square image (1:1 ratio), JPG or PNG format
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default OverviewEdit;
