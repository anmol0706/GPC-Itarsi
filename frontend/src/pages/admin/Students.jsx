import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    className: '',
    password: '',
    branch: 'CS' // Default branch
  });
  const [promoteData, setPromoteData] = useState({
    branch: 'all',
    currentClass: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [uniqueClasses, setUniqueClasses] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Clear success and error messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [success, error]);

  useEffect(() => {
    if (students.length > 0) {
      let filtered = students;

      // Filter by branch if a specific branch is selected
      if (selectedBranch !== 'all') {
        filtered = filtered.filter(student => student.branch === selectedBranch);
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(
          student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.class.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredStudents(filtered);

      // Extract unique classes for the promotion dropdown
      const classes = [...new Set(students.map(student => student.class))].sort();
      setUniqueClasses(classes);
    }
  }, [searchTerm, selectedBranch, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      console.log('Fetching students...');
      const response = await axios.get(`${config.apiUrl}/api/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Students fetched:', response.data.length);
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.response?.data?.message || 'Failed to load students');
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

  const handleAddStudent = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      console.log('Sending request to add student:', formData);
      console.log('Using API URL:', config.apiUrl);
      console.log('Using token:', token ? 'Token exists' : 'No token');

      // Validate roll number format
      if (!/^[A-Za-z0-9]+$/.test(formData.rollNumber)) {
        setError('Roll number should only contain letters and numbers');
        setLoading(false);
        return;
      }

      // Now try the actual endpoint
      const response = await axios.post(
        `${config.apiUrl}/api/admin/add-student`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Add student response:', response.data);

      // Reset form and close modal
      setFormData({
        name: '',
        rollNumber: '',
        className: '',
        password: '',
        branch: 'CS'
      });
      setShowAddModal(false);

      // Set success message
      setSuccess('Student added successfully!');

      // Refresh student list and wait for it to complete before setting loading to false
      await fetchStudents();
      setLoading(false);
    } catch (error) {
      console.error('Error adding student:', error);
      setError(error.response?.data?.message || 'Failed to add student');
      setLoading(false);
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      await axios.put(
        `${config.apiUrl}/api/admin/update-student/${selectedStudent._id}`,
        {
          name: formData.name,
          className: formData.className,
          branch: formData.branch
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
        rollNumber: '',
        className: '',
        username: '',
        password: '',
        branch: 'CS'
      });
      setSelectedStudent(null);
      setShowEditModal(false);

      // Set success message
      setSuccess('Student updated successfully!');

      // Refresh student list and wait for it to complete
      await fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      setError(error.response?.data?.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      await axios.delete(`${config.apiUrl}/api/admin/delete-student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Set success message
      setSuccess('Student deleted successfully!');

      // Refresh student list and wait for it to complete
      await fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      setError(error.response?.data?.message || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      className: student.class,
      password: '',
      branch: student.branch || 'CS' // Default to CS if branch is not set
    });
    setShowEditModal(true);
  };

  const [promotionLoading, setPromotionLoading] = useState(false);
  const [affectedStudents, setAffectedStudents] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Calculate affected students when promotion filters change
  useEffect(() => {
    if (showPromoteModal) {
      // Count how many students will be affected by the current filters
      let studentsToPromote = [...students];

      if (promoteData.branch !== 'all') {
        studentsToPromote = studentsToPromote.filter(student => student.branch === promoteData.branch);
      }

      if (promoteData.currentClass !== 'all') {
        studentsToPromote = studentsToPromote.filter(student => student.class === promoteData.currentClass);
      }

      // Filter out students already in final semester (6)
      studentsToPromote = studentsToPromote.filter(student => {
        const parts = student.class.split(' ');
        if (parts.length !== 2) return true;

        const semesterOrYear = parseInt(parts[1]);
        return !isNaN(semesterOrYear) && semesterOrYear < 6;
      });

      setAffectedStudents(studentsToPromote.length);
    }
  }, [promoteData, students, showPromoteModal]);

  const handlePromoteStudentsSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handlePromoteStudents = async () => {
    try {
      setPromotionLoading(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${config.apiUrl}/api/admin/promote-students`,
        promoteData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Create a detailed success message
      const successMsg = `${response.data.message}. ${response.data.promotedCount} students were promoted to the next class/semester.`;
      setSuccess(successMsg);
      setShowPromoteModal(false);
      setShowConfirmation(false);

      // Reset promotion form
      setPromoteData({
        branch: 'all',
        currentClass: 'all'
      });

      // Refresh student list
      fetchStudents();
    } catch (error) {
      console.error('Error promoting students:', error);
      setError(error.response?.data?.message || 'Failed to promote students');
      setShowConfirmation(false);
    } finally {
      setPromotionLoading(false);
    }
  };

  const handlePromoteInputChange = (e) => {
    const { name, value } = e.target;
    setPromoteData({
      ...promoteData,
      [name]: value
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-semibold text-primary-800">Students Management</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-primary-500/30 text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 w-full sm:w-auto admin-action-btn"
          >
            Add New Student
          </button>
          <button
            onClick={() => setShowPromoteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-accent-500/30 text-sm font-medium rounded-md shadow-sm text-white bg-accent-600 hover:bg-accent-700 w-full sm:w-auto admin-action-btn"
          >
            Promote Students
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mt-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        {/* Search Bar */}
        <div className="relative rounded-md shadow-sm flex-grow">
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md admin-form-input"
            placeholder="Search by name, roll number, or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Branch Filter */}
        <div className="flex-shrink-0">
          <label htmlFor="branch-filter" className="sr-only">Filter by Branch</label>
          <select
            id="branch-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md admin-form-input"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="all">All Branches</option>
            <option value="CS">Computer Science (CS)</option>
            <option value="ME">Mechanical Engineering (ME)</option>
            <option value="ET">Electronics & Telecom (ET)</option>
            <option value="EE">Electrical Engineering (EE)</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      {/* Students Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              {loading ? (
                <div className="bg-white px-4 py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="bg-white px-4 py-12 text-center text-gray-500">
                  {searchTerm ? 'No students match your search criteria' : 'No students available'}
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden sm:block">
                    <table className="min-w-full divide-y divide-gray-200 admin-table-responsive">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Roll Number
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Class
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Branch
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                          <tr key={student._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{student.rollNumber}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{student.class}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {student.branch || 'Not Assigned'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => openEditModal(student)}
                                className="text-blue-600 hover:text-blue-900 mr-4 admin-action-btn"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student._id)}
                                className="text-red-600 hover:text-red-900 admin-action-btn"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="sm:hidden">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {filteredStudents.map((student) => (
                        <div key={student._id} className="bg-white overflow-hidden shadow rounded-lg admin-table-card">
                          <div className="admin-mobile-card-header">
                            <h3 className="text-sm font-medium text-gray-900">{student.name}</h3>
                          </div>
                          <div className="admin-mobile-card-content">
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-500">Roll Number:</span>
                              <p className="text-sm text-gray-900">{student.rollNumber}</p>
                            </div>
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-500">Class:</span>
                              <p className="text-sm text-gray-900">{student.class}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Branch:</span>
                              <p className="text-sm text-gray-900">{student.branch || 'Not Assigned'}</p>
                            </div>
                          </div>
                          <div className="admin-mobile-card-actions">
                            <button
                              onClick={() => openEditModal(student)}
                              className="text-accent-600 hover:text-accent-800 text-sm font-medium admin-action-btn"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student._id)}
                              className="text-error hover:text-error/80 text-sm font-medium admin-action-btn"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full admin-modal">
              <form onSubmit={handleAddStudent}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 admin-modal-header">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Student</h3>
                      {error && (
                        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                          {error}
                        </div>
                      )}
                      <div className="mt-4 space-y-4 admin-form-container">
                        <div className="admin-form-group">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Roll Number
                          </label>
                          <input
                            type="text"
                            name="rollNumber"
                            id="rollNumber"
                            required
                            pattern="[A-Za-z0-9]+"
                            title="Roll number should only contain letters and numbers"
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.rollNumber}
                            onChange={handleInputChange}
                          />
                          <p className="mt-1 text-xs text-gray-500">Roll number must be unique and contain only letters and numbers</p>
                        </div>
                        <div className="admin-form-group">
                          <label htmlFor="className" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Class
                          </label>
                          <input
                            type="text"
                            name="className"
                            id="className"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.className}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="admin-form-group">
                          <label htmlFor="branch" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Branch
                          </label>
                          <select
                            name="branch"
                            id="branch"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.branch}
                            onChange={handleInputChange}
                          >
                            <option value="CS">Computer Science (CS)</option>
                            <option value="ME">Mechanical Engineering (ME)</option>
                            <option value="ET">Electronics & Telecom (ET)</option>
                            <option value="EE">Electrical Engineering (EE)</option>
                          </select>
                        </div>

                        <div className="admin-form-group">
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Password
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse admin-modal-footer">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-primary-500/30 shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm admin-action-btn"
                  >
                    Add Student
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm admin-action-btn"
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

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full admin-modal">
              <form onSubmit={handleEditStudent}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 admin-modal-header">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Student</h3>
                      <div className="mt-4 space-y-4 admin-form-container">
                        <div className="admin-form-group">
                          <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="edit-name"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label htmlFor="edit-rollNumber" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Roll Number (Read Only)
                          </label>
                          <input
                            type="text"
                            name="rollNumber"
                            id="edit-rollNumber"
                            disabled
                            className="mt-1 bg-gray-100 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.rollNumber}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label htmlFor="edit-className" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Class
                          </label>
                          <input
                            type="text"
                            name="className"
                            id="edit-className"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.className}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="admin-form-group">
                          <label htmlFor="edit-branch" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Branch
                          </label>
                          <select
                            name="branch"
                            id="edit-branch"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.branch}
                            onChange={handleInputChange}
                          >
                            <option value="CS">Computer Science (CS)</option>
                            <option value="ME">Mechanical Engineering (ME)</option>
                            <option value="ET">Electronics & Telecom (ET)</option>
                            <option value="EE">Electrical Engineering (EE)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse admin-modal-footer">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-primary-500/30 shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm admin-action-btn"
                  >
                    Update Student
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm admin-action-btn"
                    onClick={() => {
                      setSelectedStudent(null);
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

      {/* Promote Students Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full admin-modal">
              <form onSubmit={handlePromoteStudentsSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 admin-modal-header">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Promote Students</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        This will promote students to the next class/semester. For example, students in "CS 1" will be moved to "CS 2".
                      </p>
                      {error && (
                        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                          {error}
                        </div>
                      )}

                      {/* Show how many students will be affected */}
                      <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded-md text-sm">
                        <strong>{affectedStudents}</strong> student(s) will be promoted based on your current selection.
                      </div>
                      <div className="mt-4 space-y-4 admin-form-container">
                        <div className="admin-form-group">
                          <label htmlFor="branch" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Branch Filter
                          </label>
                          <select
                            name="branch"
                            id="branch"
                            className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={promoteData.branch}
                            onChange={handlePromoteInputChange}
                          >
                            <option value="all">All Branches</option>
                            <option value="CS">Computer Science (CS)</option>
                            <option value="ME">Mechanical Engineering (ME)</option>
                            <option value="ET">Electronics & Telecom (ET)</option>
                            <option value="EE">Electrical Engineering (EE)</option>
                          </select>
                          <p className="mt-1 text-xs text-gray-500">Select a specific branch or all branches</p>
                        </div>

                        <div className="admin-form-group">
                          <label htmlFor="currentClass" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Current Class Filter
                          </label>
                          <select
                            name="currentClass"
                            id="currentClass"
                            className="mt-1 focus:ring-accent-500 focus:border-accent-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={promoteData.currentClass}
                            onChange={handlePromoteInputChange}
                          >
                            <option value="all">All Classes</option>
                            {uniqueClasses.map((className) => (
                              <option key={className} value={className}>
                                {className}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-gray-500">Select a specific class or all classes</p>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-md">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-yellow-800">Important Note</h3>
                              <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                  This action will promote students to the next semester/class and cannot be undone. Students in the final semester (6) will remain in the same class.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse admin-modal-footer">
                  <button
                    type="submit"
                    disabled={promotionLoading || affectedStudents === 0}
                    className="w-full inline-flex justify-center rounded-md border border-accent-500/30 shadow-sm px-4 py-2 bg-accent-600 text-base font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 sm:ml-3 sm:w-auto sm:text-sm admin-action-btn disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {promotionLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Review Promotion'
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={promotionLoading}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm admin-action-btn disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      setShowPromoteModal(false);
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
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Confirm Student Promotion</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are about to promote <strong>{affectedStudents}</strong> student(s) to the next class/semester.
                        {promoteData.branch !== 'all' && ` Branch: ${promoteData.branch}.`}
                        {promoteData.currentClass !== 'all' && ` Current Class: ${promoteData.currentClass}.`}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        This action cannot be undone. Are you sure you want to continue?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handlePromoteStudents}
                  disabled={promotionLoading}
                >
                  {promotionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Confirm Promotion'
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowConfirmation(false)}
                  disabled={promotionLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
