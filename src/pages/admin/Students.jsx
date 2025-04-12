import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { toast } from 'react-toastify';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    className: '',
    password: '',
    branch: 'CS' // Default branch
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [groupedStudents, setGroupedStudents] = useState({});

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      let filtered = students;

      // Filter by branch if a specific branch is selected
      if (selectedBranch !== 'all') {
        filtered = filtered.filter(student => student.branch === selectedBranch);
      }

      // Filter by year if a specific year is selected
      if (selectedYear !== 'all') {
        filtered = filtered.filter(student => {
          // Extract year from class (assuming format like "1st Year", "2nd Year", etc.)
          const yearMatch = student.class.match(/(1st|2nd|3rd|I|II|III|1|2|3)/i);
          if (yearMatch) {
            const yearText = yearMatch[0].toLowerCase();
            if (yearText.includes('1') || yearText.includes('i') || yearText.includes('first')) {
              return selectedYear === '1';
            } else if (yearText.includes('2') || yearText.includes('ii') || yearText.includes('second')) {
              return selectedYear === '2';
            } else if (yearText.includes('3') || yearText.includes('iii') || yearText.includes('third')) {
              return selectedYear === '3';
            }
          }
          return false;
        });
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

      // Group students by branch and year
      const grouped = {};
      filtered.forEach(student => {
        const branch = student.branch || 'Not Assigned';

        // Extract year from class
        let year = 'Other';
        const yearMatch = student.class.match(/(1st|2nd|3rd|I|II|III|1|2|3)/i);
        if (yearMatch) {
          const yearText = yearMatch[0].toLowerCase();
          if (yearText.includes('1') || yearText.includes('i') || yearText.includes('first')) {
            year = '1st Year';
          } else if (yearText.includes('2') || yearText.includes('ii') || yearText.includes('second')) {
            year = '2nd Year';
          } else if (yearText.includes('3') || yearText.includes('iii') || yearText.includes('third')) {
            year = '3rd Year';
          }
        }

        // Create branch-year key
        const key = `${branch}-${year}`;
        if (!grouped[key]) {
          grouped[key] = {
            branch,
            year,
            students: []
          };
        }
        grouped[key].students.push(student);
      });

      setGroupedStudents(grouped);
    }
  }, [searchTerm, selectedBranch, selectedYear, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStudents(response.data);
      setFilteredStudents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.response?.data?.message || 'Failed to load students');
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
      const token = localStorage.getItem('token');

      await axios.post(
        `${API_URL}/api/admin/add-student`,
        formData,
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
        password: '',
        branch: 'CS'
      });
      setShowAddModal(false);

      // Refresh student list
      fetchStudents();
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
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_URL}/api/admin/update-student/${selectedStudent._id}`,
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

      // Refresh student list
      fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      setError(error.response?.data?.message || 'Failed to update student');
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.delete(`${API_URL}/api/admin/delete-student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh student list
      fetchStudents();
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      setError(error.response?.data?.message || 'Failed to delete student');
      toast.error('Failed to delete student');
      setLoading(false);
    }
  };

  const handleDeleteAllStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      // Delete all students one by one
      const deletePromises = students.map(student =>
        axios.delete(`${API_URL}/api/admin/delete-student/${student._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      await Promise.all(deletePromises);

      // Also reset all attendance records
      try {
        await axios.post(
          `${API_URL}/api/admin/reset-all-attendance`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } catch (attendanceError) {
        console.error('Error resetting attendance:', attendanceError);
        // Continue even if attendance reset fails
      }

      // Refresh student list
      fetchStudents();
      setShowDeleteAllModal(false);
      toast.success('All students and attendance records deleted successfully');
    } catch (error) {
      console.error('Error deleting all students:', error);
      setError(error.response?.data?.message || 'Failed to delete all students');
      toast.error('Failed to delete all students');
      setLoading(false);
      setShowDeleteAllModal(false);
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-semibold text-gray-900">Students Management</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto admin-action-btn"
          >
            Add New Student
          </button>
          <button
            onClick={() => setShowDeleteAllModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 w-full sm:w-auto admin-action-btn"
          >
            Delete All Students & Attendance
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

        {/* Year Filter */}
        <div className="flex-shrink-0">
          <label htmlFor="year-filter" className="sr-only">Filter by Year</label>
          <select
            id="year-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md admin-form-input"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Students Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              {loading ? (
                <div className="bg-white px-4 py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="bg-white px-4 py-12 text-center text-gray-500">
                  {searchTerm ? 'No students match your search criteria' : 'No students available'}
                </div>
              ) : (
                <>
                  {/* Desktop Table View - Grouped by Branch and Year */}
                  <div className="hidden sm:block">
                    {Object.keys(groupedStudents).length === 0 ? (
                      <div className="bg-white px-4 py-12 text-center text-gray-500">
                        No students match your filter criteria
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {Object.keys(groupedStudents).sort().map(key => {
                          const group = groupedStudents[key];
                          return (
                            <div key={key} className="overflow-hidden border border-gray-200 sm:rounded-lg mb-6">
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {group.branch} - {group.year}
                                  <span className="ml-2 text-sm text-gray-500">({group.students.length} students)</span>
                                </h3>
                              </div>
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
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {group.students.map((student) => (
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
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Mobile Card View */}
                  <div className="sm:hidden">
                    {Object.keys(groupedStudents).length === 0 ? (
                      <div className="bg-white px-4 py-12 text-center text-gray-500">
                        No students match your filter criteria
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Object.keys(groupedStudents).sort().map(key => {
                          const group = groupedStudents[key];
                          return (
                            <div key={key} className="mb-6">
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-t-lg border border-gray-200">
                                <h3 className="text-base font-medium text-gray-900">
                                  {group.branch} - {group.year}
                                  <span className="ml-2 text-xs text-gray-500">({group.students.length} students)</span>
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-3">
                                {group.students.map((student) => (
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
                                    </div>
                                    <div className="admin-mobile-card-actions">
                                      <button
                                        onClick={() => openEditModal(student)}
                                        className="text-blue-600 hover:text-blue-900 text-sm font-medium admin-action-btn"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteStudent(student._id)}
                                        className="text-red-600 hover:text-red-900 text-sm font-medium admin-action-btn"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
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
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.rollNumber}
                            onChange={handleInputChange}
                          />
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
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
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
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
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
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
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
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm admin-action-btn"
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
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
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
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
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
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
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
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm admin-action-btn"
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

      {/* Delete All Students Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete All Students & Attendance</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete all students and reset all attendance records? This action cannot be undone and will permanently remove all student data and attendance records from the system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteAllStudents}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete All
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteAllModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
