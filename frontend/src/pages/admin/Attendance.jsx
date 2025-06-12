import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import AttendanceStats from '../../components/admin/AttendanceStats';

const Attendance = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // Filter students based on search term and selected branch
    let filtered = students;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        student =>
          student.name.toLowerCase().includes(term) ||
          student.rollNumber.toLowerCase().includes(term) ||
          (student.class && student.class.toLowerCase().includes(term))
      );
    }

    if (selectedBranch !== 'all') {
      filtered = filtered.filter(student => student.branch === selectedBranch);
    }

    setFilteredStudents(filtered);
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

      const response = await axios.get(`${config.apiUrl}/api/students`, {
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

  const fetchStudentAttendance = async (studentId) => {
    try {
      setLoadingAttendance(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoadingAttendance(false);
        return;
      }

      const response = await axios.get(`${config.apiUrl}/api/students/attendance/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStudentAttendance(response.data.records || []);
      setLoadingAttendance(false);
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      setStudentAttendance([]);
      setLoadingAttendance(false);
    }
  };

  const handleResetAllAttendance = async () => {
    if (!confirm('Are you sure you want to reset attendance for ALL students? This action cannot be undone.')) {
      return;
    }

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

      await axios.post(
        `${config.apiUrl}/api/admin/reset-all-attendance`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('All student attendance has been reset successfully');
      setLoading(false);

      // Refresh the student list
      fetchStudents();

      // Refresh the attendance stats by forcing a re-render of the AttendanceStats component
      // This is done by toggling the activeTab and then setting it back
      setActiveTab('students');
      setTimeout(() => {
        setActiveTab('dashboard');
      }, 100);
    } catch (error) {
      console.error('Error resetting all attendance:', error);
      setError(error.response?.data?.message || 'Failed to reset attendance');
      setLoading(false);
    }
  };

  const handleResetStudentAttendance = async (studentId) => {
    if (!confirm('Are you sure you want to reset attendance for this student? This action cannot be undone.')) {
      return;
    }

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

      await axios.post(
        `${config.apiUrl}/api/admin/reset-student-attendance/${studentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Student attendance has been reset successfully');
      setLoading(false);

      // If the student modal is open, refresh the attendance data
      if (showStudentModal && selectedStudent && selectedStudent._id === studentId) {
        fetchStudentAttendance(studentId);
      }

      // Refresh the student list
      fetchStudents();
    } catch (error) {
      console.error('Error resetting student attendance:', error);
      setError(error.response?.data?.message || 'Failed to reset attendance');
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (studentId, recordId, isPresent) => {
    try {
      setLoadingAttendance(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoadingAttendance(false);
        return;
      }

      // Simplify - just use the index directly
      console.log('Using recordId (index):', recordId, typeof recordId);

      // Prepare request data
      const requestData = {
        studentId,
        recordId,
        present: isPresent
      };
      console.log('Sending request:', requestData);

      // Update the UI optimistically
      const updatedAttendance = [...studentAttendance];
      if (updatedAttendance[recordId]) {
        updatedAttendance[recordId].status = isPresent ? 'present' : 'absent';
        setStudentAttendance(updatedAttendance);
      }

      // Send the request to the server
      const response = await axios.put(
        `${config.apiUrl}/api/admin/update-student-attendance`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Server response:', response.data);

      // If the server returned the updated record with an _id, update it locally
      if (response.data && response.data.record && response.data.record._id) {
        console.log('Server returned updated record with ID:', response.data.record._id);

        // Make sure the local record has the _id from the server
        if (updatedAttendance[recordId]) {
          updatedAttendance[recordId]._id = response.data.record._id;
          setStudentAttendance(updatedAttendance);
        }
      }

      setSuccess('Attendance updated successfully');
      setLoadingAttendance(false);
    } catch (error) {
      console.error('Error updating attendance:', error);
      // Revert the optimistic update
      fetchStudentAttendance(studentId);
      setError(error.response?.data?.message || 'Failed to update attendance');
      setLoadingAttendance(false);
    }
  };

  const openStudentModal = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
    fetchStudentAttendance(student._id);
  };

  const closeStudentModal = () => {
    setShowStudentModal(false);
    setSelectedStudent(null);
    setStudentAttendance([]);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate attendance statistics
  const calculateAttendanceStats = (attendance) => {
    if (!attendance || attendance.length === 0) {
      return { total: 0, present: 0, absent: 0, percentage: 0 };
    }

    const total = attendance.length;
    const present = attendance.filter(record => record.status === 'present').length;
    const absent = total - present;
    const percentage = Math.round((present / total) * 100);

    return { total, present, absent, percentage };
  };

  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-semibold text-primary-800">Attendance Management</h1>
        <button
          onClick={handleResetAllAttendance}
          className="inline-flex items-center px-4 py-2 border border-error/30 text-sm font-medium rounded-md shadow-sm text-white bg-error hover:bg-error/90 w-full sm:w-auto admin-action-btn"
        >
          Reset All Attendance
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`${
              activeTab === 'dashboard'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`${
              activeTab === 'students'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Student Management
          </button>
        </nav>
      </div>

      {/* Success and Error Messages */}
      {success && (
        <div className="mt-4 bg-success/10 border border-success/30 text-success px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      {error && (
        <div className="mt-4 bg-error/10 border border-error/30 text-error px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'dashboard' ? (
          <AttendanceStats />
        ) : (
          <>
            {/* Search and Filter Controls */}
            <div className="mt-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
              {/* Search Bar */}
              <div className="relative rounded-md shadow-sm flex-grow">
                <input
                  type="text"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md admin-form-input"
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
                <select
                  id="branch"
                  name="branch"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md admin-form-input"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="all">All Branches</option>
                  <option value="CS">Computer Science</option>
                  <option value="IT">Information Technology</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="CE">Civil Engineering</option>
                  <option value="EE">Electrical Engineering</option>
                  <option value="EC">Electronics & Communication</option>
                </select>
              </div>
            </div>

            {/* Students Grid */}
            <div className="mt-8">
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredStudents.map((student) => (
                    <div
                      key={student._id}
                      className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-300"
                      onClick={() => openStudentModal(student)}
                    >
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            {student.profilePicture ? (
                              <img
                                src={`${config.apiUrl}/uploads/${student.profilePicture}`}
                                alt={student.name}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900 truncate">{student.name}</h3>
                            <p className="text-sm text-gray-500">{student.rollNumber}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Class:</span>
                            <span className="font-medium text-gray-900">{student.class}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-500">Branch:</span>
                            <span className="font-medium text-gray-900">{student.branch || 'Not Assigned'}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResetStudentAttendance(student._id);
                            }}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-error/30 text-sm font-medium rounded-md text-white bg-error hover:bg-error/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error"
                          >
                            Reset Attendance
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Student Attendance Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-primary-800">
                      {selectedStudent.name}'s Attendance
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Roll Number: {selectedStudent.rollNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        Class: {selectedStudent.class}
                      </p>
                      <p className="text-sm text-gray-500">
                        Branch: {selectedStudent.branch || 'Not Assigned'}
                      </p>
                    </div>

                    {/* Attendance Statistics */}
                    {!loadingAttendance && (
                      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                        <div className="bg-gray-100 p-2 rounded">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-lg font-semibold">{calculateAttendanceStats(studentAttendance).total}</p>
                        </div>
                        <div className="bg-success/10 p-2 rounded">
                          <p className="text-xs text-gray-500">Present</p>
                          <p className="text-lg font-semibold">{calculateAttendanceStats(studentAttendance).present}</p>
                        </div>
                        <div className="bg-error/10 p-2 rounded">
                          <p className="text-xs text-gray-500">Absent</p>
                          <p className="text-lg font-semibold">{calculateAttendanceStats(studentAttendance).absent}</p>
                        </div>
                        <div className="bg-primary-100 p-2 rounded">
                          <p className="text-xs text-gray-500">Percentage</p>
                          <p className="text-lg font-semibold">{calculateAttendanceStats(studentAttendance).percentage}%</p>
                        </div>
                      </div>
                    )}

                    {/* Attendance Records */}
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-primary-700">Attendance Records</h4>
                      {loadingAttendance ? (
                        <div className="py-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Loading attendance records...</p>
                        </div>
                      ) : studentAttendance.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4 text-center">No attendance records found</p>
                      ) : (
                        <div className="mt-2 max-h-60 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Subject
                                </th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {studentAttendance.map((record, index) => (
                                <tr key={record._id || `record-${index}`}>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {formatDate(record.date)}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {record.subject}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        record.status === 'present' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                                      }`}
                                    >
                                      {record.status === 'present' ? 'Present' : 'Absent'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                                    <button
                                      onClick={() => {
                                        console.log('Updating record:', record, 'at index:', index);
                                        // Always use index for simplicity
                                        handleUpdateAttendance(
                                          selectedStudent._id,
                                          index,
                                          record.status === 'absent'
                                        );
                                      }}
                                      className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded ${
                                        record.status === 'present'
                                          ? 'text-error bg-error/10 hover:bg-error/20'
                                          : 'text-success bg-success/10 hover:bg-success/20'
                                      }`}
                                    >
                                      {record.status === 'present' ? 'Mark Absent' : 'Mark Present'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeStudentModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-error/30 shadow-sm px-4 py-2 bg-error text-base font-medium text-white hover:bg-error/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleResetStudentAttendance(selectedStudent._id)}
                >
                  Reset Attendance
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
