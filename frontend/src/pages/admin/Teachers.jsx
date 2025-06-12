import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    department: '' // Keeping department as it's required by the backend
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState([]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (teachers.length > 0) {
      setFilteredTeachers(
        teachers.filter(
          teacher =>
            teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (teacher.subjects && teacher.subjects.some(subject =>
              subject.toLowerCase().includes(searchTerm.toLowerCase())
            ))
        )
      );
    }
  }, [searchTerm, teachers]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${config.apiUrl}/api/teachers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTeachers(response.data);
      setFilteredTeachers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError(error.response?.data?.message || 'Failed to load teachers');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For username field, sanitize input to allow only valid characters
    if (name === 'username') {
      // Allow only letters, numbers, dots, underscores, and hyphens
      const sanitizedValue = value.replace(/[^a-zA-Z0-9._-]/g, '');
      setFormData({
        ...formData,
        [name]: sanitizedValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const token = localStorage.getItem('token');

      // Validate username
      if (!formData.username) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9._-]+$/;
      if (!usernameRegex.test(formData.username)) {
        setError('Username can only contain letters, numbers, dots, underscores, and hyphens');
        setLoading(false);
        return;
      }

      // Validate name
      if (!formData.name) {
        setError('Name is required');
        setLoading(false);
        return;
      }

      // Validate department
      if (!formData.department) {
        setError('Department is required');
        setLoading(false);
        return;
      }

      // Validate password
      if (!formData.password) {
        setError('Password is required');
        setLoading(false);
        return;
      }

      console.log('Sending request to add teacher with username:', formData.username);

      const response = await axios.post(
        `${config.apiUrl}/api/admin/add-teacher`,
        {
          name: formData.name,
          department: formData.department,
          username: formData.username,
          password: formData.password,
          email: formData.email || undefined // Only send if provided
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Teacher added successfully:', response.data);

      // Reset form and close modal
      setFormData({
        name: '',
        username: '',
        password: '',
        email: '',
        department: ''
      });
      setShowAddModal(false);

      // Refresh teacher list
      fetchTeachers();
    } catch (error) {
      console.error('Error adding teacher:', error);

      // Handle specific error cases
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400 && data.message === 'Username already exists') {
          setError('This username is already taken. Please choose a different username.');
        } else if (status === 400 && data.message === 'Duplicate key error') {
          if (data.field === 'email') {
            setError('A teacher with this email already exists. Please choose a different username.');
          } else if (data.field === 'username') {
            setError('This username is already taken. Please choose a different username.');
          } else {
            setError(data.error || 'A teacher with these details already exists.');
          }
        } else if (status === 400 && data.message.includes('required')) {
          setError(data.message);
        } else if (status === 401) {
          setError('Authentication error. Please log in again.');
        } else if (status === 403) {
          setError('You do not have permission to add teachers.');
        } else {
          setError(data.message || 'Failed to add teacher');
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request
        setError('Error setting up request: ' + error.message);
      }

      setLoading(false);
    }
  };

  const handleEditTeacher = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const token = localStorage.getItem('token');

      // Convert subjects string to array
      const subjectsArray = formData.subjects
        ? formData.subjects.split(',').map(subject => subject.trim())
        : [];

      console.log('Sending request to update teacher with ID:', selectedTeacher._id);

      const response = await axios.put(
        `${config.apiUrl}/api/admin/update-teacher/${selectedTeacher._id}`,
        {
          name: formData.name,
          department: formData.department,
          subjects: subjectsArray,
          qualification: formData.qualification,
          experience: formData.experience,
          designation: formData.designation
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Teacher updated successfully:', response.data);

      // Reset form and close modal
      setFormData({
        name: '',
        department: '',
        subjects: '',
        username: '',
        password: '',
        qualification: '',
        experience: '',
        designation: ''
      });
      setSelectedTeacher(null);
      setShowEditModal(false);

      // Refresh teacher list
      fetchTeachers();
    } catch (error) {
      console.error('Error updating teacher:', error);

      // Handle specific error cases
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400 && data.message === 'Username already exists') {
          setError('This username is already taken. Please choose a different username.');
        } else if (status === 400 && data.message === 'Duplicate key error') {
          if (data.field === 'email') {
            setError('A teacher with this email already exists. Please choose a different username.');
          } else if (data.field === 'username') {
            setError('This username is already taken. Please choose a different username.');
          } else {
            setError(data.error || 'A teacher with these details already exists.');
          }
        } else if (status === 400 && data.message.includes('required')) {
          setError(data.message);
        } else if (status === 401) {
          setError('Authentication error. Please log in again.');
        } else if (status === 403) {
          setError('You do not have permission to update teachers.');
        } else if (status === 404) {
          setError('Teacher not found. They may have been deleted.');
        } else {
          setError(data.message || 'Failed to update teacher');
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request
        setError('Error setting up request: ' + error.message);
      }

      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.delete(`${config.apiUrl}/api/admin/delete-teacher/${teacherId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh teacher list
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      setError(error.response?.data?.message || 'Failed to delete teacher');
      setLoading(false);
    }
  };

  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      department: teacher.department,
      subjects: teacher.subjects ? teacher.subjects.join(', ') : '',
      password: '',
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      designation: teacher.designation || ''
    });
    setShowEditModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-primary-800">Teachers Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-primary-500/30 text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Add New Teacher
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-4">
        <div className="relative rounded-md shadow-sm">
          <input
            type="text"
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search by name, department, or subject..."
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

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Teachers Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              {loading ? (
                <div className="bg-white px-4 py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading teachers...</p>
                </div>
              ) : filteredTeachers.length === 0 ? (
                <div className="bg-white px-4 py-12 text-center text-gray-500">
                  {searchTerm ? 'No teachers match your search criteria' : 'No teachers available'}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subjects
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{teacher.department}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {teacher.subjects && teacher.subjects.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {teacher.subjects.map((subject, index) => (
                                  <span key={index} className="bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                    {subject}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              'No subjects assigned'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openEditModal(teacher)}
                            className="text-accent-600 hover:text-accent-800 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher._id)}
                            className="text-error hover:text-error/80"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddTeacher}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Teacher</h3>

                      {/* Form Error Message */}
                      {error && (
                        <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                          <strong>Error:</strong> {error}
                        </div>
                      )}

                      <div className="mt-4 space-y-4">
                        <div className="form-group">
                          <label htmlFor="name" className="form-label">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="form-input"
                            placeholder="Enter teacher's full name"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="username" className="form-label">
                            Username
                          </label>
                          <input
                            type="text"
                            name="username"
                            id="username"
                            required
                            className="form-input"
                            placeholder="Enter login username (letters, numbers, dots, underscores only)"
                            value={formData.username}
                            onChange={handleInputChange}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Use only letters, numbers, dots, underscores, and hyphens for username.
                          </p>
                        </div>
                        <div className="form-group">
                          <label htmlFor="password" className="form-label">
                            Password
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            className="form-input"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Teachers will use this password to log in and complete their profile.
                          </p>
                        </div>
                        <div className="form-group">
                          <label htmlFor="email" className="form-label">
                            Email (Optional)
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            className="form-input"
                            placeholder="Enter teacher's email (optional)"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="department" className="form-label">
                            Department
                          </label>
                          <select
                            name="department"
                            id="department"
                            required
                            className="form-input"
                            value={formData.department}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Department</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                            <option value="Science & Humanities">Science & Humanities</option>
                          </select>
                        </div>
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-blue-700">
                                Teachers will be able to complete their profile with additional details after logging in.
                              </p>
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
                  >
                    Add Teacher
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

      {/* Edit Teacher Modal */}
      {showEditModal && selectedTeacher && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditTeacher}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Teacher</h3>

                      {/* Form Error Message */}
                      {error && (
                        <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                          <strong>Error:</strong> {error}
                        </div>
                      )}

                      <div className="mt-4 space-y-4">
                        <div className="form-group">
                          <label htmlFor="name" className="form-label">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="form-input"
                            placeholder="Enter teacher's full name"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="department" className="form-label">
                            Department
                          </label>
                          <select
                            name="department"
                            id="department"
                            required
                            className="form-input"
                            value={formData.department}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Department</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                            <option value="Science & Humanities">Science & Humanities</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="subjects" className="form-label">
                            Subjects (comma separated)
                          </label>
                          <input
                            type="text"
                            name="subjects"
                            id="subjects"
                            className="form-input"
                            placeholder="e.g. Mathematics, Physics, Chemistry"
                            value={formData.subjects}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="edit-qualification" className="form-label">
                            Qualification
                          </label>
                          <input
                            type="text"
                            name="qualification"
                            id="edit-qualification"
                            className="form-input"
                            placeholder="e.g. Ph.D. in Computer Science"
                            value={formData.qualification}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="edit-experience" className="form-label">
                            Experience
                          </label>
                          <input
                            type="text"
                            name="experience"
                            id="edit-experience"
                            className="form-input"
                            placeholder="e.g. 5 years"
                            value={formData.experience}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="edit-designation" className="form-label">
                            Designation
                          </label>
                          <input
                            type="text"
                            name="designation"
                            id="edit-designation"
                            className="form-input"
                            placeholder="e.g. Assistant Professor"
                            value={formData.designation}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Update Teacher
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setSelectedTeacher(null);
                      setShowEditModal(false);
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

export default Teachers;
