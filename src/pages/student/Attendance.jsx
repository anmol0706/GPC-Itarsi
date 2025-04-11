import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState({});
  const [subjectWiseAttendance, setSubjectWiseAttendance] = useState({});

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (attendanceData) {
      // Filter attendance based on selected subject
      if (selectedSubject === 'all') {
        setFilteredAttendance(attendanceData.attendance);
      } else {
        setFilteredAttendance(
          attendanceData.attendance.filter(record => record.subject === selectedSubject)
        );
      }
    }
  }, [selectedSubject, attendanceData]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5001/api/students/attendance', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Attendance data received:', response.data);
      setAttendanceData(response.data);

      // Check if attendance data exists and has attendance array
      if (response.data && Array.isArray(response.data.attendance)) {
        // Extract unique subjects
        const uniqueSubjects = [...new Set(response.data.attendance
          .filter(record => record && record.subject) // Filter out records without subject
          .map(record => record.subject))];
        setSubjects(uniqueSubjects);

        // Calculate monthly attendance
        const monthlyData = calculateMonthlyAttendance(response.data.attendance);
        setMonthlyAttendance(monthlyData);

        // Calculate subject-wise attendance
        const subjectData = calculateSubjectWiseAttendance(response.data.attendance, uniqueSubjects);
        setSubjectWiseAttendance(subjectData);

        // Set filtered attendance to all attendance initially
        setFilteredAttendance(response.data.attendance);
      } else {
        // Handle case when attendance array is missing or not an array
        setSubjects([]);
        setMonthlyAttendance({});
        setSubjectWiseAttendance({});
        setFilteredAttendance([]);
        console.error('Invalid attendance data format:', response.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError(error.response?.data?.message || 'Failed to load attendance');
      setLoading(false);
    }
  };

  const calculateMonthlyAttendance = (attendance) => {
    const monthlyData = {};

    // Handle case when attendance is undefined or empty
    if (!attendance || attendance.length === 0) {
      return {};
    }

    attendance.forEach(record => {
      // Ensure date is valid
      if (!record.date) return;

      const date = new Date(record.date);
      if (isNaN(date.getTime())) return; // Skip invalid dates

      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          total: 0,
          present: 0
        };
      }

      monthlyData[monthYear].total += 1;
      if (record.present) {
        monthlyData[monthYear].present += 1;
      }
    });

    // Calculate percentage for each month
    Object.keys(monthlyData).forEach(month => {
      const { total, present } = monthlyData[month];
      monthlyData[month].percentage = Math.round((present / total) * 100);
    });

    return monthlyData;
  };

  const calculateSubjectWiseAttendance = (attendance, subjects) => {
    const subjectData = {};

    // Handle case when attendance or subjects are undefined or empty
    if (!attendance || attendance.length === 0 || !subjects || subjects.length === 0) {
      return {};
    }

    subjects.forEach(subject => {
      const subjectAttendance = attendance.filter(record => record.subject === subject);
      const total = subjectAttendance.length;
      const present = subjectAttendance.filter(record => record.present).length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      subjectData[subject] = {
        total,
        present,
        percentage
      };
    });

    return subjectData;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Attendance Record</h1>

      {loading ? (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : (
        <>
          {/* Attendance Summary */}
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Attendance Summary</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Overall attendance statistics.</p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Classes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{attendanceData.totalClasses}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Classes Attended</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{attendanceData.presentClasses}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Attendance Percentage</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            attendanceData.attendancePercentage >= 75 ? 'bg-green-600' :
                            attendanceData.attendancePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-600'
                          }`}
                          style={{ width: `${attendanceData.attendancePercentage}%` }}
                        ></div>
                      </div>
                      <span className="ml-2">{attendanceData.attendancePercentage}%</span>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Subject-wise Attendance */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Subject-wise Attendance</h2>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <div key={subject} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{subject}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subjectWiseAttendance[subject].percentage >= 75 ? 'bg-green-100 text-green-800' :
                            subjectWiseAttendance[subject].percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {subjectWiseAttendance[subject].percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className={`h-2.5 rounded-full ${
                            subjectWiseAttendance[subject].percentage >= 75 ? 'bg-green-600' :
                            subjectWiseAttendance[subject].percentage >= 60 ? 'bg-yellow-500' : 'bg-red-600'
                          }`}
                          style={{ width: `${subjectWiseAttendance[subject].percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Present: {subjectWiseAttendance[subject].present} / {subjectWiseAttendance[subject].total} classes
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Attendance */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Monthly Attendance</h2>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.keys(monthlyAttendance).map((month) => (
                    <div key={month} className="flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-900">{month}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            monthlyAttendance[month].percentage >= 75 ? 'bg-green-100 text-green-800' :
                            monthlyAttendance[month].percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {monthlyAttendance[month].percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className={`h-2.5 rounded-full ${
                            monthlyAttendance[month].percentage >= 75 ? 'bg-green-600' :
                            monthlyAttendance[month].percentage >= 60 ? 'bg-yellow-500' : 'bg-red-600'
                          }`}
                          style={{ width: `${monthlyAttendance[month].percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Present: {monthlyAttendance[month].present} / {monthlyAttendance[month].total} classes
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Attendance Records */}
          <div className="mt-8">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Detailed Attendance Records</h2>
              <div>
                <label htmlFor="subject-filter" className="sr-only">Filter by Subject</label>
                <select
                  id="subject-filter"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    {filteredAttendance.length === 0 ? (
                      <div className="bg-white px-4 py-5 text-center text-gray-500">
                        No attendance records found
                      </div>
                    ) : (
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
                          {filteredAttendance.map((record, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(record.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.subject}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    record.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {record.present ? 'Present' : 'Absent'}
                                </span>
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
        </>
      )}
    </div>
  );
};

export default Attendance;
