import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';

const Attendance = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [teacherData, setTeacherData] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [branches, setBranches] = useState(['CS', 'ME', 'ET', 'EE']);

  // Set teacher data from user context if available
  useEffect(() => {
    // Log user object for debugging
    console.log('User object in Attendance component:', user);

    if (user) {
      // Check if subjects are directly in the user object
      if (user.subjects && user.subjects.length > 0) {
        console.log('Found subjects directly in user object:', user.subjects);
        setTeacherData({
          ...user,
          subjects: user.subjects
        });
        setSelectedSubject(user.subjects[0]);
      }
      // Also check if subjects are in user.userData (for backward compatibility)
      else if (user.userData && user.userData.subjects && user.userData.subjects.length > 0) {
        console.log('Found subjects in user.userData:', user.userData.subjects);
        setTeacherData(user.userData);
        setSelectedSubject(user.userData.subjects[0]);
      }
      // If no subjects found in either location, fetch teacher data
      else {
        console.log('No subjects found in user object, fetching teacher data');
        fetchTeacherData();
      }
    } else {
      console.log('No user object available, fetching teacher data');
      fetchTeacherData();
    }

    fetchStudents();
  }, [user]);

  useEffect(() => {
    if (students.length > 0) {
      // Extract unique classes
      const uniqueClasses = [...new Set(students.map(student => student.class))];
      setClasses(uniqueClasses);

      // Filter students based on search term, selected class, and selected branch
      let filtered = students;

      if (selectedClass) {
        filtered = filtered.filter(student => student.class === selectedClass);
      }

      if (selectedBranch) {
        filtered = filtered.filter(student => student.branch === selectedBranch);
      }

      if (searchTerm) {
        filtered = filtered.filter(
          student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredStudents(filtered);
    }
  }, [searchTerm, selectedClass, selectedBranch, students]);

  const fetchTeacherData = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${config.apiUrl}/api/teachers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Teacher profile data:', response.data);

      // Check if we received valid data
      if (!response.data) {
        console.error('No data received from teacher profile endpoint');
        setError('Failed to load teacher data');
        setLoading(false);
        return;
      }

      setTeacherData(response.data);

      // Check if subjects exist and log the result
      if (response.data.subjects && Array.isArray(response.data.subjects)) {
        console.log('Subjects found:', response.data.subjects);
        if (response.data.subjects.length > 0) {
          setSelectedSubject(response.data.subjects[0]);
        } else {
          console.warn('Teacher has no subjects assigned');
        }
      } else {
        console.error('No subjects array found in teacher data');
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      setError(error.response?.data?.message || 'Failed to load teacher data');
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${config.apiUrl}/api/teachers/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStudents(response.data);
      setFilteredStudents(response.data);

      // Initialize attendance data
      const initialAttendance = {};
      response.data.forEach(student => {
        initialAttendance[student._id] = true; // Default to present
      });

      setAttendanceData(initialAttendance);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.response?.data?.message || 'Failed to load students');
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, isPresent) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: isPresent
    }));
  };

  const handleSubmitAttendance = async () => {
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

      if (!selectedSubject) {
        setError('Please select a subject');
        setLoading(false);
        return;
      }

      // Create attendance records for each student
      const attendancePromises = filteredStudents.map(student => {
        return axios.post(
          `${config.apiUrl}/api/teachers/mark-attendance`,
          {
            studentId: student._id,
            subject: selectedSubject,
            present: attendanceData[student._id],
            date: new Date()
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      });

      await Promise.all(attendancePromises);

      setSuccess('Attendance marked successfully!');
      setLoading(false);
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError(error.response?.data?.message || 'Failed to mark attendance');
      setLoading(false);
    }
  };

  const handleSelectAll = (isPresent) => {
    const updatedAttendance = {};
    filteredStudents.forEach(student => {
      updatedAttendance[student._id] = isPresent;
    });
    setAttendanceData(prev => ({
      ...prev,
      ...updatedAttendance
    }));
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary-800">Mark Attendance</h1>

      {loading && !students.length ? (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : (
        <>
          {success && (
            <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              {success}
            </div>
          )}

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    required
                  >
                    <option value="">Select Subject</option>
                    {teacherData?.subjects && teacherData.subjects.length > 0 ? (
                      teacherData.subjects.map((subject, index) => (
                        <option key={index} value={subject}>
                          {subject}
                        </option>
                      ))
                    ) : (
                      <option value="no-subjects" disabled>
                        No subjects available. Please contact administrator.
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="class" className="block text-sm font-medium text-gray-700">
                    Class (Optional)
                  </label>
                  <select
                    id="class"
                    name="class"
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

                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                    Branch (Optional)
                  </label>
                  <select
                    id="branch"
                    name="branch"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                  >
                    <option value="">All Branches</option>
                    {branches.map((branch, index) => (
                      <option key={index} value={branch}>
                        {branch === 'CS' ? 'Computer Science (CS)' :
                         branch === 'ME' ? 'Mechanical Engineering (ME)' :
                         branch === 'ET' ? 'Electronics & Telecom (ET)' :
                         branch === 'EE' ? 'Electrical Engineering (EE)' : branch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search Students
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-green-500 focus:border-green-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search by name or roll number"
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

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-success/30 text-xs font-medium rounded shadow-sm text-white bg-success hover:bg-success/90"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="inline-flex items-center px-3 py-1.5 border border-error/30 text-xs font-medium rounded shadow-sm text-white bg-error hover:bg-error/90"
                >
                  Mark All Absent
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex flex-col">
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
                        {searchTerm || selectedClass || selectedBranch ? 'No students match your search criteria' : 'No students available'}
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Roll Number
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Class
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Branch
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Attendance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredStudents.map((student) => (
                            <tr key={student._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {student.rollNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.class}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.branch || 'Not Assigned'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center">
                                    <input
                                      id={`present-${student._id}`}
                                      name={`attendance-${student._id}`}
                                      type="radio"
                                      className="focus:ring-success h-4 w-4 text-success border-gray-300"
                                      checked={attendanceData[student._id] === true}
                                      onChange={() => handleAttendanceChange(student._id, true)}
                                    />
                                    <label htmlFor={`present-${student._id}`} className="ml-2 block text-sm text-gray-700">
                                      Present
                                    </label>
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      id={`absent-${student._id}`}
                                      name={`attendance-${student._id}`}
                                      type="radio"
                                      className="focus:ring-error h-4 w-4 text-error border-gray-300"
                                      checked={attendanceData[student._id] === false}
                                      onChange={() => handleAttendanceChange(student._id, false)}
                                    />
                                    <label htmlFor={`absent-${student._id}`} className="ml-2 block text-sm text-gray-700">
                                      Absent
                                    </label>
                                  </div>
                                </div>
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
          </div>

          <div className="mt-8 flex justify-end">
            {!teacherData?.subjects?.length && (
              <div className="mr-4 text-sm text-red-500 self-center">
                No subjects available. Please contact administrator to assign subjects.
              </div>
            )}
            <button
              type="button"
              onClick={handleSubmitAttendance}
              disabled={loading || filteredStudents.length === 0 || !selectedSubject || !teacherData?.subjects?.length}
              className="inline-flex items-center px-4 py-2 border border-primary-500/30 text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;
