import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';

// Import new attendance components
import AttendanceSummary from '../../components/attendance/AttendanceSummary';
import AttendanceTrendChart from '../../components/attendance/AttendanceTrendChart';
import SubjectAttendanceChart from '../../components/attendance/SubjectAttendanceChart';
import AttendanceCalendar from '../../components/attendance/AttendanceCalendar';
import AttendanceTable from '../../components/attendance/AttendanceTable';

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

      const response = await axios.get(`${config.apiUrl}/api/students/attendance`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Attendance data received:', response.data);
      setAttendanceData(response.data);

      // Check if attendance data exists and has attendance array
      if (response.data) {
        // Make sure we have an attendance array
        const attendanceRecords = response.data.attendance || [];

        // Extract unique subjects
        const uniqueSubjects = [...new Set(attendanceRecords
          .filter(record => record && record.subject) // Filter out records without subject
          .map(record => record.subject))];
        setSubjects(uniqueSubjects);

        // Calculate monthly attendance
        const monthlyData = calculateMonthlyAttendance(attendanceRecords);
        setMonthlyAttendance(monthlyData);

        // Calculate subject-wise attendance
        const subjectData = calculateSubjectWiseAttendance(attendanceRecords, uniqueSubjects);
        setSubjectWiseAttendance(subjectData);

        // Set filtered attendance to all attendance initially
        setFilteredAttendance(attendanceRecords);
      } else {
        // Handle case when attendance data is missing
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
      <h1 className="text-2xl font-semibold text-primary-800 mb-6">Attendance Dashboard</h1>

      {loading ? (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : (
        <>
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <AttendanceSummary attendanceData={attendanceData} />
            <AttendanceTrendChart attendanceData={attendanceData} timeframe="monthly" />
          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SubjectAttendanceChart attendanceData={attendanceData} />
            <AttendanceCalendar attendanceData={attendanceData} />
          </div>

          {/* Detailed Records */}
          <div className="mb-6">
            <AttendanceTable attendanceData={attendanceData} />
          </div>

          {/* Attendance Tips */}
          {attendanceData && attendanceData.attendancePercentage < 75 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Attendance Tips</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Regular attendance is crucial for academic success.</li>
                      <li>If you need to miss a class, inform your teacher in advance.</li>
                      <li>Minimum 75% attendance is required to be eligible for examinations.</li>
                      <li>Medical absences require proper documentation.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Attendance;
