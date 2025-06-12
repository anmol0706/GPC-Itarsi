import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AttendanceTrendChart = ({ attendanceData, timeframe }) => {
  // Default empty data
  const defaultData = {
    labels: [],
    datasets: [
      {
        label: 'Attendance %',
        data: [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
      },
    ],
  };

  // If no attendance data, return default chart
  if (!attendanceData || Object.keys(attendanceData).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-primary-700 mb-4">Attendance Trend</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No attendance data available</p>
        </div>
      </div>
    );
  }

  // Process data based on timeframe
  const processData = () => {
    const labels = [];
    const attendanceValues = [];
    const goodAttendance = [];
    const averageAttendance = [];
    const poorAttendance = [];

    if (timeframe === 'weekly') {
      // Process weekly data
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      days.forEach(day => {
        labels.push(day);
        const dayData = attendanceData[day.toLowerCase()] || 0;
        attendanceValues.push(dayData);

        // Add threshold lines
        goodAttendance.push(75);
        averageAttendance.push(60);
        poorAttendance.push(40);
      });
    } else {
      // Process monthly data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach(month => {
        labels.push(month);
        const monthData = attendanceData[month.toLowerCase()] || 0;
        attendanceValues.push(monthData);

        // Add threshold lines
        goodAttendance.push(75);
        averageAttendance.push(60);
        poorAttendance.push(40);
      });
    }

    return {
      labels,
      datasets: [
        {
          label: 'Attendance %',
          data: attendanceValues,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          tension: 0.3,
        },
        {
          label: 'Good Attendance',
          data: goodAttendance,
          borderColor: 'rgba(34, 197, 94, 0.7)',
          borderDash: [5, 5],
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Average Attendance',
          data: averageAttendance,
          borderColor: 'rgba(234, 179, 8, 0.7)',
          borderDash: [5, 5],
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Poor Attendance',
          data: poorAttendance,
          borderColor: 'rgba(239, 68, 68, 0.7)',
          borderDash: [5, 5],
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        },
      ],
    };
  };

  const chartData = attendanceData ? processData() : defaultData;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Attendance Percentage',
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        title: {
          display: true,
          text: timeframe === 'weekly' ? 'Day of Week' : 'Month',
        }
      }
    },
  };

  // Calculate average attendance
  const calculateAverage = () => {
    if (!attendanceData || Object.keys(attendanceData).length === 0) return 0;

    const values = Object.values(attendanceData);
    if (values.length === 0) return 0;

    const sum = values.reduce((acc, val) => acc + val, 0);
    return (sum / values.length).toFixed(1);
  };

  const averageAttendance = calculateAverage();

  // Determine attendance status color
  const getStatusColor = (avg) => {
    if (avg >= 75) return 'text-success';
    if (avg >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-primary-700">Attendance Trend</h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">Average Attendance</p>
          <p className={`text-xl font-bold ${getStatusColor(averageAttendance)}`}>
            {averageAttendance}%
          </p>
        </div>
      </div>

      <div className="h-64">
        <Line options={options} data={chartData} />
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">Attendance Categories:</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-success rounded-full mr-1"></div>
            <span className="text-xs text-gray-500">≥ 75%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-warning rounded-full mr-1"></div>
            <span className="text-xs text-gray-500">60-74%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-error rounded-full mr-1"></div>
            <span className="text-xs text-gray-500">&lt; 60%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

AttendanceTrendChart.propTypes = {
  attendanceData: PropTypes.object,
  timeframe: PropTypes.oneOf(['weekly', 'monthly'])
};

export default AttendanceTrendChart;
