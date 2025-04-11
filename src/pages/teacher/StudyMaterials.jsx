import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';

const StudyMaterials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    forClass: '',
    file: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  // Set teacher data from user context if available
  useEffect(() => {
    if (user) {
      // Always proceed with fetching materials if we have a user
      fetchStudyMaterials();
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    if (materials.length > 0) {
      let filtered = materials;

      if (selectedClass) {
        filtered = filtered.filter(material => material.forClass === selectedClass);
      }

      if (searchTerm) {
        filtered = filtered.filter(
          material =>
            material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (material.description && material.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setFilteredMaterials(filtered);
    }
  }, [searchTerm, selectedClass, materials]);

  const fetchStudyMaterials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      // Try to get study materials from the fallback endpoint first
      try {
        const response = await axios.get(`${API_URL}/api/all-study-materials`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Check if response data is an array
        if (Array.isArray(response.data)) {
          // Verify file URLs by making HEAD requests
          const materialsWithFileStatus = await Promise.all(
            response.data.map(async (material) => {
              try {
                if (material.fileUrl) {
                  await axios.head(`${API_URL}/uploads/study-materials/${material.fileUrl}`);
                  return { ...material, fileExists: true };
                }
                return { ...material, fileExists: false };
              } catch (error) {
                console.warn(`File not found for material: ${material.title}`);
                return { ...material, fileExists: false };
              }
            })
          );

          setMaterials(materialsWithFileStatus);
          setFilteredMaterials(materialsWithFileStatus);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.warn('Error fetching from general endpoint, trying teacher-specific endpoint');
      }

      // If general endpoint fails, try the teacher-specific endpoint
      const response = await axios.get(`${API_URL}/api/teachers/study-materials`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Check if response data is an array
      if (Array.isArray(response.data)) {
        // Verify file URLs by making HEAD requests
        const materialsWithFileStatus = await Promise.all(
          response.data.map(async (material) => {
            try {
              if (material.fileUrl) {
                await axios.head(`${API_URL}/uploads/study-materials/${material.fileUrl}`);
                return { ...material, fileExists: true };
              }
              return { ...material, fileExists: false };
            } catch (error) {
              console.warn(`File not found for material: ${material.title}`);
              return { ...material, fileExists: false };
            }
          })
        );

        setMaterials(materialsWithFileStatus);
        setFilteredMaterials(materialsWithFileStatus);
      } else {
        // If not an array, set empty array to prevent errors
        console.warn('Study materials response is not an array:', response.data);
        setMaterials([]);
        setFilteredMaterials([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching study materials:', error);
      // Don't show 'Teacher not found' error to the user
      const errorMessage = error.response?.data?.message === 'Teacher not found'
        ? 'Failed to load study materials'
        : (error.response?.data?.message || 'Failed to load study materials');
      setError(errorMessage);
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      const response = await axios.get(`${API_URL}/api/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Extract unique classes
      const uniqueClasses = [...new Set(response.data.map(student => student.class))];
      setClasses(uniqueClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0]
    });
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess('');

      const token = localStorage.getItem('token');

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('forClass', formData.forClass);
      formDataToSend.append('file', formData.file);

      await axios.post(
        `${API_URL}/api/teachers/upload-study-material`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        forClass: '',
        file: null
      });
      setShowAddModal(false);

      setSuccess('Study material uploaded successfully!');

      // Refresh study materials
      fetchStudyMaterials();
    } catch (error) {
      console.error('Error uploading study material:', error);
      setError(error.response?.data?.message || 'Failed to upload study material');
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this study material?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess('');

      const token = localStorage.getItem('token');

      await axios.delete(`${API_URL}/api/teachers/study-materials/${materialId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Study material deleted successfully!');

      // Refresh study materials
      fetchStudyMaterials();
    } catch (error) {
      console.error('Error deleting study material:', error);
      setError(error.response?.data?.message || 'Failed to delete study material');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Study Materials</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          Upload New Material
        </button>
      </div>

      {error && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Materials
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-green-500 focus:border-green-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by title or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="class-filter" className="block text-sm font-medium text-gray-700">
                Filter by Class
              </label>
              <select
                id="class-filter"
                name="class-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((cls, index) => (
                  <option key={index} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {loading && !materials.length ? (
          <div className="bg-white px-4 py-12 text-center shadow rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading study materials...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="bg-white px-4 py-12 text-center shadow rounded-lg text-gray-500">
            No study materials available. Upload new materials using the button above.
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-white px-4 py-12 text-center shadow rounded-lg text-gray-500">
            {searchTerm || selectedClass ? 'No study materials match your search criteria' : 'No study materials available'}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredMaterials.map((material) => (
                <li key={material._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-green-600 truncate">
                        {material.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {formatDate(material.uploadDate)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {material.description || 'No description'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        For Class: {material.forClass}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      {material.fileExists ? (
                        <a
                          href={`${API_URL}/uploads/study-materials/${material.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-green-600 hover:text-green-500"
                        >
                          Download Material
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">File not available</span>
                      )}
                      <button
                        onClick={() => handleDeleteMaterial(material._id)}
                        className="text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddMaterial}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Upload Study Material</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.title}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description (optional)
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            rows="3"
                            className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.description}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>
                        <div>
                          <label htmlFor="forClass" className="block text-sm font-medium text-gray-700">
                            For Class
                          </label>
                          <select
                            id="forClass"
                            name="forClass"
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                            value={formData.forClass}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Class</option>
                            {classes.map((cls, index) => (
                              <option key={index} value={cls}>
                                {cls}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            File
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
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                                >
                                  <span>Upload a file</span>
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                    required
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX up to 10MB
                              </p>
                              {formData.file && (
                                <p className="text-xs text-green-500 font-medium">
                                  Selected file: {formData.file.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={loading}
                  >
                    {loading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setFormData({
                        title: '',
                        description: '',
                        forClass: '',
                        file: null
                      });
                      setShowAddModal(false);
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

export default StudyMaterials;
