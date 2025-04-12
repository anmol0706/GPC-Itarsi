import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { toast } from 'react-toastify';

const Hods = () => {
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHod, setSelectedHod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    designation: '',
    qualification: '',
    experience: '',
    message: '',
    image: null
  });
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchHods();
  }, []);

  const fetchHods = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/hods`);
      if (response.data && Array.isArray(response.data)) {
        setHods(response.data);
      }
    } catch (error) {
      console.error('Error fetching HODs:', error);
      toast.error('Failed to load HODs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      department: '',
      designation: '',
      qualification: '',
      experience: '',
      message: '',
      image: null
    });
    setPreviewUrl('');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const openEditModal = (hod) => {
    setSelectedHod(hod);
    setFormData({
      name: hod.name,
      department: hod.department,
      designation: hod.designation || '',
      qualification: hod.qualification || '',
      experience: hod.experience || '',
      message: hod.message || '',
      image: null
    });
    if (hod.image) {
      setPreviewUrl(`${API_URL}/uploads/profiles/${hod.image}`);
    } else {
      setPreviewUrl('');
    }
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedHod(null);
    resetForm();
  };

  const handleAddHod = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.department) {
      toast.error('Name and department are required');
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('department', formData.department);
      formDataObj.append('designation', formData.designation);
      formDataObj.append('qualification', formData.qualification);
      formDataObj.append('experience', formData.experience);
      formDataObj.append('message', formData.message);
      if (formData.image) {
        formDataObj.append('image', formData.image);
      }

      const response = await axios.post(`${API_URL}/api/hods`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data) {
        toast.success('HOD added successfully');
        fetchHods();
        closeAddModal();
      }
    } catch (error) {
      console.error('Error adding HOD:', error);
      toast.error('Failed to add HOD');
    }
  };

  const handleUpdateHod = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.department) {
      toast.error('Name and department are required');
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('department', formData.department);
      formDataObj.append('designation', formData.designation);
      formDataObj.append('qualification', formData.qualification);
      formDataObj.append('experience', formData.experience);
      formDataObj.append('message', formData.message);
      if (formData.image) {
        formDataObj.append('image', formData.image);
      }

      const response = await axios.put(`${API_URL}/api/hods/${selectedHod._id}`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data) {
        toast.success('HOD updated successfully');
        fetchHods();
        closeEditModal();
      }
    } catch (error) {
      console.error('Error updating HOD:', error);
      toast.error('Failed to update HOD');
    }
  };

  const handleDeleteHod = async (id) => {
    if (!window.confirm('Are you sure you want to delete this HOD?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/api/hods/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data) {
        toast.success('HOD deleted successfully');
        fetchHods();
      }
    } catch (error) {
      console.error('Error deleting HOD:', error);
      toast.error('Failed to delete HOD');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">HODs Management</h1>
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Add New HOD
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : hods.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">No HODs found. Add your first HOD.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {hods.map((hod) => (
              <div key={hod._id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-4">
                      {hod.image ? (
                        <img
                          src={`${API_URL}/uploads/profiles/${hod.image}`}
                          alt={hod.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{hod.name}</h3>
                      <p className="text-sm text-gray-600">{hod.department}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    {hod.designation && (
                      <p className="text-sm text-gray-600"><span className="font-medium">Designation:</span> {hod.designation}</p>
                    )}
                    {hod.qualification && (
                      <p className="text-sm text-gray-600"><span className="font-medium">Qualification:</span> {hod.qualification}</p>
                    )}
                    {hod.experience && (
                      <p className="text-sm text-gray-600"><span className="font-medium">Experience:</span> {hod.experience}</p>
                    )}
                  </div>
                  
                  {hod.message && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 line-clamp-3">{hod.message}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => openEditModal(hod)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteHod(hod._id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add HOD Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeAddModal}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddHod}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New HOD</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input
                      type="text"
                      id="designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                    <input
                      type="text"
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <input
                      type="text"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="3"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    {previewUrl && (
                      <div className="mt-2">
                        <img src={previewUrl} alt="Preview" className="h-24 w-24 object-cover rounded-md" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add HOD
                  </button>
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit HOD Modal */}
      {showEditModal && selectedHod && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeEditModal}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUpdateHod}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit HOD</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <input
                      type="text"
                      id="edit-department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="edit-designation" className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input
                      type="text"
                      id="edit-designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="edit-qualification" className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                    <input
                      type="text"
                      id="edit-qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="edit-experience" className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <input
                      type="text"
                      id="edit-experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="edit-message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      id="edit-message"
                      name="message"
                      rows="3"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                    <input
                      type="file"
                      id="edit-image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    {previewUrl && (
                      <div className="mt-2">
                        <img src={previewUrl} alt="Preview" className="h-24 w-24 object-cover rounded-md" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Update HOD
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default Hods;
