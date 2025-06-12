import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AttendanceStats = () => {
  const [stats, setStats] = useState({
    overall: { total: 0, present: 0, absent: 0, percentage: 0 },
    byBranch: {},
    byClass: {},
    recentTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttendanceStats();
  }, []);

  const fetchAttendanceStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${config.apiUrl}/api/admin/attendance/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Transform API response to match expected format
      const apiData = response.data;

      // Create branch data from attendanceByClass
      const byBranch = {};
      if (apiData.attendanceByClass) {
        apiData.attendanceByClass.forEach(classData => {
          // Extract branch from class name (assuming format like "CS 1", "ME 2", etc.)
          const branch = classData.className.split(' ')[0];
          if (!byBranch[branch]) {
            byBranch[branch] = {
              total: classData.studentCount,
              present: Math.round(classData.studentCount * classData.averageAttendance / 100),
              absent: Math.round(classData.studentCount * (100 - classData.averageAttendance) / 100),
              percentage: classData.averageAttendance
            };
          }
        });
      }

      // Create class data from attendanceByClass
      const byClass = {};
      if (apiData.attendanceByClass) {
        apiData.attendanceByClass.forEach(classData => {
          byClass[classData.className] = {
            total: classData.studentCount,
            present: Math.round(classData.studentCount * classData.averageAttendance / 100),
            absent: Math.round(classData.studentCount * (100 - classData.averageAttendance) / 100),
            percentage: classData.averageAttendance
          };
        });
      }

      // Create recent trends from recentAttendance
      const recentTrends = apiData.recentAttendance ?
        apiData.recentAttendance.map(record => ({
          date: new Date(record.date).toISOString().split('T')[0],
          percentage: record.percentage
        })) : [];

      // Create overall data
      const overall = {
        total: apiData.classesThisMonth || 0,
        present: Math.round(apiData.totalStudents * apiData.averageAttendance / 100) || 0,
        absent: Math.round(apiData.totalStudents * (100 - apiData.averageAttendance) / 100) || 0,
        percentage: apiData.averageAttendance || 0
      };

      // Set all attendance counts to 0 as requested
      const zeroedOverall = {
        total: overall.total,
        present: 0,
        absent: 0,
        percentage: 0
      };

      // Set branch data to 0
      const zeroedByBranch = {};
      Object.keys(byBranch).forEach(branch => {
        zeroedByBranch[branch] = {
          total: byBranch[branch].total,
          present: 0,
          absent: 0,
          percentage: 0
        };
      });

      // Set class data to 0
      const zeroedByClass = {};
      Object.keys(byClass).forEach(className => {
        zeroedByClass[className] = {
          total: byClass[className].total,
          present: 0,
          absent: 0,
          percentage: 0
        };
      });

      // Set transformed data with zeroed values
      setStats({
        overall: zeroedOverall,
        byBranch: zeroedByBranch,
        byClass: zeroedByClass,
        recentTrends: recentTrends.map(trend => ({ ...trend, percentage: 0 }))
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance statistics:', error);
      setError(error.response?.data?.message || 'Failed to load attendance statistics');
      setLoading(false);

      // Set dummy data with zero attendance and zero total classes
      setStats({
        overall: { total: 0, present: 0, absent: 0, percentage: 0 },
        byBranch: {
          CS: { total: 0, present: 0, absent: 0, percentage: 0 },
          ME: { total: 0, present: 0, absent: 0, percentage: 0 },
          ET: { total: 0, present: 0, absent: 0, percentage: 0 },
          EE: { total: 0, present: 0, absent: 0, percentage: 0 }
        },
        byClass: {
          'First Year': { total: 0, present: 0, absent: 0, percentage: 0 },
          'Second Year': { total: 0, present: 0, absent: 0, percentage: 0 },
          'Third Year': { total: 0, present: 0, absent: 0, percentage: 0 }
        },
        recentTrends: [
          { date: '2023-01-01', percentage: 0 },
          { date: '2023-01-02', percentage: 0 },
          { date: '2023-01-03', percentage: 0 },
          { date: '2023-01-04', percentage: 0 },
          { date: '2023-01-05', percentage: 0 }
        ]
      });
    }
  };

  // Prepare data for pie chart
  const pieData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [stats.overall.present, stats.overall.total > 0 ? stats.overall.total : 1], // Show total as absent to make chart visible
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for branch bar chart
  const branchBarData = {
    labels: Object.keys(stats.byBranch),
    datasets: [
      {
        label: 'Attendance Percentage by Branch',
        data: Object.values(stats.byBranch).map(branch => branch.percentage),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for class bar chart
  const classBarData = {
    labels: Object.keys(stats.byClass),
    datasets: [
      {
        label: 'Attendance Percentage by Class',
        data: Object.values(stats.byClass).map(cls => cls.percentage),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Bar chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : (
        <>
          {/* Overall Attendance Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">Overall Attendance</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overall.total}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-2xl font-bold text-green-600">{stats.overall.present}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-2xl font-bold text-red-600">{stats.overall.absent}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Percentage</p>
                <p className="text-2xl font-bold text-blue-600">{stats.overall.percentage}%</p>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <div className="w-64 h-64">
                <Pie data={pieData} />
              </div>
            </div>
          </div>

          {/* Branch-wise Attendance */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">Attendance by Branch</h2>
            <div className="h-80">
              <Bar data={branchBarData} options={barOptions} />
            </div>
          </div>

          {/* Class-wise Attendance */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">Attendance by Class</h2>
            <div className="h-80">
              <Bar data={classBarData} options={barOptions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceStats;
