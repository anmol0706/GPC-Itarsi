import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    subjects: '',
    username: '',
    password: '',
    qualification: '',
    experience: '',
    designation: ''
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

      const response = await axios.get(`${API_URL}/api/teachers`, {
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
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Convert subjects string to array
      const subjectsArray = formData.subjects
        ? formData.subjects.split(',').map(subject => subject.trim())
        : [];

      await axios.post(
        `${API_URL}/api/admin/add-teacher`,
        {
          name: formData.name,
          department: formData.department,
          subjects: subjectsArray,
          username: formData.username,
          password: formData.password,
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
      setShowAddModal(false);

      // Refresh teacher list
      fetchTeachers();
    } catch (error) {
      console.error('Error adding teacher:', error);
      setError(error.response?.data?.message || 'Failed to add teacher');
      setLoading(false);
    }
  };

  const handleEditTeacher = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Convert subjects string to array
      const subjectsArray = formData.subjects
        ? formData.subjects.split(',').map(subject => subject.trim())
        : [];

      await axios.put(
        `${API_URL}/api/admin/update-teacher/${selectedTeacher._id}`,
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

      // Reset form and close modal
      setFormData({
        name: '',
        department: '',
        subjects: '',
        username: '',
        password: ''
      });
      setSelectedTeacher(null);
      setShowEditModal(false);

      // Refresh teacher list
      fetchTeachers();
    } catch (error) {
      console.error('Error updating teacher:', error);
      setError(error.response?.data?.message || 'Failed to update teacher');
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

      await axios.delete(`${API_URL}/api/admin/delete-teacher/${teacherId}`, {
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
        <h1 className="text-2xl font-semibold text-gray-900">Teachers Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Add New Teacher
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-4">
        <div className="relative rounded-md shadow-sm">
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
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
          {error}
        </div>
      )}

      {/* Teachers Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              {loading ? (
                <div className="bg-white px-4 py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
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
                                  <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
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
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher._id)}
                            className="text-red-600 hover:text-red-900"
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
                          <input
                            type="text"
                            name="department"
                            id="department"
                            required
                            className="form-input"
                            placeholder="Enter department (e.g. CS, Electronics and Telecommunication)"
                            value={formData.department}
                            onChange={handleInputChange}
                          />
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
                          <label htmlFor="username" className="form-label">
                            Username
                          </label>
                          <input
                            type="text"
                            name="username"
                            id="username"
                            required
                            className="form-input"
                            placeholder="Enter login username"
                            value={formData.username}
                            onChange={handleInputChange}
                          />
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
                        </div>
                        <div className="form-group">
                          <label htmlFor="qualification" className="form-label">
                            Qualification
                          </label>
                          <input
                            type="text"
                            name="qualification"
                            id="qualification"
                            className="form-input"
                            placeholder="e.g. Ph.D. in Computer Science"
                            value={formData.qualification}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="experience" className="form-label">
                            Experience
                          </label>
                          <input
                            type="text"
                            name="experience"
                            id="experience"
                            className="form-input"
                            placeholder="e.g. 5 years"
                            value={formData.experience}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="designation" className="form-label">
                            Designation
                          </label>
                          <input
                            type="text"
                            name="designation"
                            id="designation"
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
                    Add Teacher
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
                          <input
                            type="text"
                            name="department"
                            id="department"
                            required
                            className="form-input"
                            placeholder="Enter department (e.g. CS, Electronics and Telecommunication)"
                            value={formData.department}
                            onChange={handleInputChange}
                          />
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
