import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';

const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    file: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    fetchStudyMaterials();
    fetchClassesAndSubjects();
  }, []);

  useEffect(() => {
    if (materials.length > 0) {
      let filtered = materials;

      if (selectedClass) {
        filtered = filtered.filter(material => material.class === selectedClass);
      }

      if (selectedSubject) {
        filtered = filtered.filter(material => material.subject === selectedSubject);
      }

      if (searchTerm) {
        filtered = filtered.filter(
          material =>
            material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (material.description && material.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (material.uploadedBy && material.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setFilteredMaterials(filtered);
    }
  }, [searchTerm, selectedClass, selectedSubject, materials]);

  const fetchStudyMaterials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${config.apiUrl}/api/study-materials`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMaterials(response.data);
      setFilteredMaterials(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching study materials:', error);
      setError(error.response?.data?.message || 'Failed to load study materials');
      setLoading(false);
    }
  };

  const fetchClassesAndSubjects = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      // Fetch students to get classes
      const studentsResponse = await axios.get(`${config.apiUrl}/api/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Extract unique classes
      const uniqueClasses = [...new Set(studentsResponse.data.map(student => student.class))];
      setClasses(uniqueClasses);

      // Fetch teachers to get subjects
      const teachersResponse = await axios.get(`${config.apiUrl}/api/teachers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Extract unique subjects
      const allSubjects = [];
      teachersResponse.data.forEach(teacher => {
        if (teacher.subjects && teacher.subjects.length > 0) {
          allSubjects.push(...teacher.subjects);
        }
      });
      const uniqueSubjects = [...new Set(allSubjects)];
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error fetching classes and subjects:', error);
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

    // Validate file type
    const fileName = formData.file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'];

    if (!allowedExtensions.includes(fileExtension)) {
      setError(`File type .${fileExtension} is not supported. Please upload a file with one of these extensions: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF, CSV, JPG, PNG, GIF, ZIP, RAR`);
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
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('class', formData.class);
      formDataToSend.append('file', formData.file);

      // Try the upload-simple endpoint first, which is more reliable for study materials
      try {
        await axios.post(
          `${config.apiUrl}/api/study-materials/upload-simple`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } catch (uploadError) {
        console.error('Error with simple upload, trying cloudinary upload:', uploadError);

        // If simple upload fails, try the regular cloudinary upload
        await axios.post(
          `${config.apiUrl}/api/study-materials/upload-cloudinary`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        subject: '',
        class: '',
        file: null
      });
      setShowAddModal(false);
      setSuccess('Study material added successfully');

      // Refresh materials list
      fetchStudyMaterials();
    } catch (error) {
      console.error('Error adding study material:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.response?.data?.details || 'Failed to add study material';
      setError(errorMessage);
    } finally {
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

      await axios.delete(`${config.apiUrl}/api/study-materials/${materialId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Study material deleted successfully');

      // Refresh materials list
      fetchStudyMaterials();
    } catch (error) {
      console.error('Error deleting study material:', error);
      setError(error.response?.data?.message || 'Failed to delete study material');
    } finally {
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
        <h1 className="text-2xl font-semibold text-primary-800">Study Materials Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-primary-500/30 text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Add New Material
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-error/10 border border-error/30 text-error px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 bg-success/10 border border-success/30 text-success px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Materials
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by title, description, or teacher"
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
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((className) => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700">
                Filter by Subject
              </label>
              <select
                id="subject-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {loading && !materials.length ? (
          <div className="bg-white px-4 py-12 text-center shadow rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading study materials...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-white px-4 py-12 text-center shadow rounded-lg text-gray-500">
            {searchTerm || selectedClass || selectedSubject ? 'No study materials match your search criteria' : 'No study materials available'}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredMaterials.map((material) => (
                <li key={material._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-medium text-primary-800">{material.title}</h3>
                        <div className="mt-1 flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mr-2">
                            {material.subject}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                            {material.class}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="text-sm text-gray-500">
                          Uploaded: {formatDate(material.createdAt)}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        By: {material.uploadedBy && material.uploadedBy.name ? material.uploadedBy.name : 'Unknown'}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <a
                        href={material.file && material.file.includes('cloudinary') ? material.file : `${axios.defaults.baseURL}/uploads/study-materials/${material.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-accent-600 hover:text-accent-500"
                      >
                        Download Material
                      </a>
                      <button
                        onClick={() => handleDeleteMaterial(material._id)}
                        className="text-sm font-medium text-error hover:text-red-500"
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
                      <h3 className="text-lg leading-6 font-medium text-primary-800">Add New Study Material</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows="3"
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.description}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                            Subject
                          </label>
                          <select
                            id="subject"
                            name="subject"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select a subject</option>
                            {subjects.map((subject) => (
                              <option key={subject} value={subject}>{subject}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="class" className="block text-sm font-medium text-gray-700">
                            Class
                          </label>
                          <select
                            id="class"
                            name="class"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            value={formData.class}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select a class</option>
                            {classes.map((className) => (
                              <option key={className} value={className}>{className}</option>
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
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.csv,.jpg,.jpeg,.png,.gif,.zip,.rar"
                                    required
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF, CSV, JPG, PNG, GIF, ZIP, RAR (up to 50MB)
                              </p>
                              {formData.file && (
                                <p className="text-sm text-primary-600 mt-2">
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
                    className="w-full inline-flex justify-center rounded-md border border-primary-500/30 shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={loading}
                  >
                    {loading ? 'Uploading...' : 'Upload Material'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowAddModal(false)}
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
