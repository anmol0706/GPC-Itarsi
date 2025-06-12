import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${config.apiUrl}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
    setConfirmationMessage('');
  };

  const confirmRoleChange = () => {
    if (selectedUser.role === 'admin' && newRole !== 'admin') {
      setConfirmationMessage('Warning: Changing an admin to another role may affect system access. Are you sure?');
    } else if (newRole === 'admin') {
      setConfirmationMessage('Warning: Giving admin privileges grants full system access. Are you sure?');
    } else {
      submitRoleChange();
    }
  };

  const submitRoleChange = async () => {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/users/${selectedUser._id}/change-role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === selectedUser._id ? response.data.user : user
        )
      );
      
      setSuccessMessage(`User role updated successfully to ${newRole}`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      setShowRoleModal(false);
    } catch (err) {
      console.error('Error changing user role:', err);
      setError(err.response?.data?.message || 'Failed to change user role');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      case 'hod':
        return 'bg-yellow-100 text-yellow-800';
      case 'principal':
        return 'bg-indigo-100 text-indigo-800';
      case 'developer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    // Filter by role
    if (filter !== 'all' && user.role !== filter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary-800">User Management</h1>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <DashboardCard
        title="All Users"
        headerClassName="bg-primary-50 text-primary-800"
        isLoading={loading}
      >
        <div className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="inline-flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium ${
                    filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('admin')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium ${
                    filter === 'admin' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Administrators
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('principal')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium ${
                    filter === 'principal' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Principal
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('hod')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium ${
                    filter === 'hod' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  HODs
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('teacher')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium ${
                    filter === 'teacher' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Teachers
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('student')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium ${
                    filter === 'student' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Students
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.profilePicture ? 
                              (user.profilePicture.startsWith('http') ? 
                                user.profilePicture : 
                                `${config.apiUrl}/uploads/${user.profilePicture}`) : 
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.username}</div>
                      {user.rollNumber && (
                        <div className="text-sm text-gray-500">Roll: {user.rollNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRoleChange(user)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardCard>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Change User Role
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are changing the role for <strong>{selectedUser.name}</strong>.
                      </p>
                      
                      <div className="mt-4">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                          Select New Role
                        </label>
                        <select
                          id="role"
                          name="role"
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="hod">HOD</option>
                          <option value="principal">Principal</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      
                      {confirmationMessage && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded">
                          {confirmationMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {confirmationMessage ? (
                  <>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={submitRoleChange}
                    >
                      Yes, I'm Sure
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setConfirmationMessage('')}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={confirmRoleChange}
                    >
                      Change Role
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowRoleModal(false)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
