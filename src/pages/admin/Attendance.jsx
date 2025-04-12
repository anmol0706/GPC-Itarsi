import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import StudentCard from '../../components/StudentCard';
import { toast } from 'react-toastify';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [classes, setClasses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [groupedAttendance, setGroupedAttendance] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'detail'
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (attendance.length > 0) {
      // Extract unique classes
      const uniqueClasses = [...new Set(attendance.map(record => record.class))].filter(Boolean);
      setClasses(uniqueClasses);

      // Extract unique branches
      const uniqueBranches = [...new Set(attendance.map(record => record.branch))].filter(Boolean);
      setBranches(uniqueBranches);

      // Apply filters
      let filtered = [...attendance];

      // Filter by class
      if (selectedClass) {
        filtered = filtered.filter(record => record.class === selectedClass);
      }

      // Filter by branch
      if (selectedBranch) {
        filtered = filtered.filter(record => record.branch === selectedBranch);
      }

      // Filter by year
      if (selectedYear) {
        filtered = filtered.filter(record => {
          // Extract year from class (assuming format like "1st Year", "2nd Year", etc.)
          const yearMatch = record.class?.match(/(1st|2nd|3rd|I|II|III|1|2|3)/i);
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
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          record =>
            record.studentName?.toLowerCase().includes(term) ||
            record.rollNumber?.toLowerCase().includes(term)
        );
      }

      setFilteredAttendance(filtered);

      // Group students by branch and year
      const grouped = {};
      filtered.forEach(record => {
        const branch = record.branch || 'Not Assigned';

        // Extract year from class
        let year = 'Other';
        const yearMatch = record.class?.match(/(1st|2nd|3rd|I|II|III|1|2|3)/i);
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
        grouped[key].students.push(record);
      });

      setGroupedAttendance(grouped);
    }
  }, [attendance, searchTerm, selectedClass, selectedBranch, selectedYear]);

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

  const handleStudentClick = (student) => {
    setSelectedStudentDetails(student);
    setViewMode('detail');
  };

  const handleBackToGrid = () => {
    setSelectedStudentDetails(null);
    setViewMode('grid');
  };

  const handleResetAllAttendance = () => {
    setConfirmAction('resetAll');
    setShowConfirmModal(true);
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

      // Get all students
      const studentsResponse = await axios.get(`${API_URL}/api/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const students = studentsResponse.data;

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
      await axios.post(
        `${API_URL}/api/admin/reset-all-attendance`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Refresh attendance data
      fetchAttendance();
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
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleResetAllAttendance}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700"
          >
            Reset All Attendance
          </button>
          <button
            onClick={() => setShowDeleteAllModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            Delete All Students
          </button>
        </div>
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
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
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
          <label htmlFor="branch-filter" className="block text-sm font-medium text-gray-700">
            Filter by Branch
          </label>
          <select
            id="branch-filter"
            name="branch-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            <option value="CS">Computer Science (CS)</option>
            <option value="ME">Mechanical Engineering (ME)</option>
            <option value="ET">Electronics & Telecom (ET)</option>
            <option value="EE">Electrical Engineering (EE)</option>
          </select>
        </div>

        <div>
          <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700">
            Filter by Year
          </label>
          <select
            id="year-filter"
            name="year-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
          </select>
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
        ) : viewMode === 'grid' ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Student Attendance</h2>

            {Object.keys(groupedAttendance).length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No students match your filter criteria
              </div>
            ) : (
              <div className="space-y-8">
                {Object.keys(groupedAttendance).sort().map(key => {
                  const group = groupedAttendance[key];
                  return (
                    <div key={key} className="mb-6">
                      <div className="bg-gradient-to-r from-green-50 to-teal-50 px-4 py-2 rounded-t-lg border border-gray-200 mb-3">
                        <h3 className="text-base font-medium text-gray-900">
                          {group.branch} - {group.year}
                          <span className="ml-2 text-xs text-gray-500">({group.students.length} students)</span>
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {group.students.map((record) => (
                          <StudentCard
                            key={record._id}
                            student={{
                              _id: record._id,
                              name: record.studentName,
                              rollNumber: record.rollNumber,
                              class: record.class,
                              profilePicture: record.profilePicture
                            }}
                            onClick={() => handleStudentClick(record)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <button
                  onClick={handleBackToGrid}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 mr-2"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
              </div>
              <div>
                <button
                  onClick={() => handleResetStudentAttendance(selectedStudentDetails)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Reset Attendance
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    {selectedStudentDetails.profilePicture ? (
                      <img
                        src={`${API_URL}/uploads/profiles/${selectedStudentDetails.profilePicture}`}
                        alt={selectedStudentDetails.studentName}
                        className="h-12 w-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudentDetails.studentName)}&background=6366F1&color=fff`;
                        }}
                      />
                    ) : (
                      <span className="text-primary-600 font-medium text-xl">{selectedStudentDetails.studentName.charAt(0)}</span>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{selectedStudentDetails.studentName}</h3>
                    <p className="text-sm text-gray-500">Roll Number: {selectedStudentDetails.rollNumber}</p>
                    <p className="text-sm text-gray-500">Class: {selectedStudentDetails.class}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {selectedStudentDetails.records.length} Attendance Records
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Attendance Records:</h4>
                  <div className="overflow-x-auto">
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
                        {selectedStudentDetails.records.map((attendance, index) => (
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Attendance Confirmation Modal */}
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

export default Attendance;
