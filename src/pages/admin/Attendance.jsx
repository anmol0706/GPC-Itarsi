import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (attendance.length > 0) {
      // Extract unique classes
      const uniqueClasses = [...new Set(attendance.map(record => record.class))].filter(Boolean);
      setClasses(uniqueClasses);

      // Apply filters
      let filtered = [...attendance];

      // Filter by class
      if (selectedClass) {
        filtered = filtered.filter(record => record.class === selectedClass);
      }

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          record =>
            record.studentName?.toLowerCase().includes(term) ||
            record.rollNumber?.toLowerCase().includes(term)
        );
      }

      setFilteredAttendance(filtered);
    }
  }, [attendance, searchTerm, selectedClass]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/admin/attendance`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAttendance(response.data);
      setFilteredAttendance(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError(error.response?.data?.message || 'Failed to load attendance records');
      setLoading(false);
    }
  };

  const handleResetStudentAttendance = (student) => {
    setSelectedStudent(student);
    setConfirmAction('resetStudent');
    setShowConfirmModal(true);
  };

  const handleResetAllAttendance = () => {
    setConfirmAction('resetAll');
    setShowConfirmModal(true);
  };

  const confirmReset = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess('');
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      if (confirmAction === 'resetStudent' && selectedStudent) {
        await axios.post(
          `${API_URL}/api/admin/reset-student-attendance/${selectedStudent.studentId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSuccess(`Attendance reset successfully for ${selectedStudent.studentName}`);
      } else if (confirmAction === 'resetAll') {
        await axios.post(
          `${API_URL}/api/admin/reset-all-attendance`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSuccess('All attendance records reset successfully');
      }

      // Refresh attendance data
      fetchAttendance();
    } catch (error) {
      console.error('Error resetting attendance:', error);
      setError(error.response?.data?.message || 'Failed to reset attendance');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setSelectedStudent(null);
      setConfirmAction(null);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Attendance Management</h1>
        <button
          onClick={handleResetAllAttendance}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        >
          Reset All Attendance
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      {/* Search and Filter */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search by Name or Roll Number
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-green-500 focus:border-green-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search..."
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

      {/* Attendance Records */}
      <div className="mt-8">
        {loading ? (
          <div className="bg-white px-4 py-12 text-center shadow rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading attendance records...</p>
          </div>
        ) : filteredAttendance.length === 0 ? (
          <div className="bg-white px-4 py-12 text-center shadow rounded-lg text-gray-500">
            No attendance records found.
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredAttendance.map((record) => (
                <li key={record._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{record.studentName}</h3>
                        <p className="text-sm text-gray-500">Roll Number: {record.rollNumber}</p>
                        <p className="text-sm text-gray-500">Class: {record.class}</p>
                      </div>
                      <div>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {record.records.length} Attendance Records
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Recent Records:</h4>
                      <div className="mt-2 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subject
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {record.records.slice(0, 5).map((attendance, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(attendance.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {attendance.subject}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    attendance.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {attendance.status === 'present' ? 'Present' : 'Absent'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {record.records.length > 5 && (
                        <p className="mt-2 text-sm text-gray-500">
                          Showing 5 of {record.records.length} records
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <button
                        onClick={() => handleResetStudentAttendance(record)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Reset Attendance
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {confirmAction === 'resetStudent' ? 'Reset Student Attendance' : 'Reset All Attendance'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {confirmAction === 'resetStudent'
                          ? `Are you sure you want to reset all attendance records for ${selectedStudent?.studentName}? This action cannot be undone.`
                          : 'Are you sure you want to reset attendance records for all students? This action cannot be undone.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmReset}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedStudent(null);
                    setConfirmAction(null);
                  }}
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

export default Attendance;
