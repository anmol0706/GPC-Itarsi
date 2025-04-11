import { useState, useEffect } from 'react';
import axios from 'axios';
import sanitizeHtml from '../../utils/sanitizeHtml';
import { API_URL } from '../../config/api';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    important: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotices, setFilteredNotices] = useState([]);

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    if (notices.length > 0) {
      setFilteredNotices(
        notices.filter(
          notice =>
            notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notice.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, notices]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/notices`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotices(response.data);
      setFilteredNotices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notices:', error);
      setError(error.response?.data?.message || 'Failed to load notices');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddNotice = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.post(
        `${API_URL}/api/notices`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Reset form and close modal
      setFormData({
        title: '',
        content: '',
        important: false
      });
      setShowAddModal(false);

      // Refresh notice list
      fetchNotices();
    } catch (error) {
      console.error('Error adding notice:', error);
      setError(error.response?.data?.message || 'Failed to add notice');
      setLoading(false);
    }
  };

  const handleEditNotice = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_URL}/api/notices/${selectedNotice._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Reset form and close modal
      setFormData({
        title: '',
        content: '',
        important: false
      });
      setSelectedNotice(null);
      setShowEditModal(false);

      // Refresh notice list
      fetchNotices();
    } catch (error) {
      console.error('Error updating notice:', error);
      setError(error.response?.data?.message || 'Failed to update notice');
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.delete(`${API_URL}/api/notices/${noticeId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh notice list
      fetchNotices();
    } catch (error) {
      console.error('Error deleting notice:', error);
      setError(error.response?.data?.message || 'Failed to delete notice');
      setLoading(false);
    }
  };

  const openEditModal = (notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      important: notice.important
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Notices Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Add New Notice
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-4">
        <div className="relative rounded-md shadow-sm">
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search notices..."
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

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Notices List */}
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="px-4 py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading notices...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            {searchTerm ? 'No notices match your search criteria' : 'No notices available'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredNotices.map((notice) => (
              <li key={notice._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {notice.title}
                      </p>
                      {notice.important && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Important
                        </span>
                      )}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {formatDate(notice.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex sm:flex-1">
                      <div className="text-sm text-gray-500">
                        {notice.content.length > 150
                          ? <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(`${notice.content.substring(0, 150)}...`) }} />
                          : <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(notice.content) }} />}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      <button
                        onClick={() => openEditModal(notice)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(notice._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddNotice}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Notice</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.title}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                            Content
                          </label>
                          <textarea
                            name="content"
                            id="content"
                            rows="4"
                            required
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.content}
                            onChange={handleInputChange}
                          ></textarea>
                          <p className="mt-1 text-xs text-gray-500">
                            You can add links using HTML: <code>&lt;a href="https://example.com"&gt;Link text&lt;/a&gt;</code>
                          </p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="important"
                            id="important"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={formData.important}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="important" className="ml-2 block text-sm text-gray-700">
                            Mark as important
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add Notice
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

      {/* Edit Notice Modal */}
      {showEditModal && selectedNotice && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditNotice}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Notice</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.title}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                            Content
                          </label>
                          <textarea
                            name="content"
                            id="content"
                            rows="4"
                            required
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.content}
                            onChange={handleInputChange}
                          ></textarea>
                          <p className="mt-1 text-xs text-gray-500">
                            You can add links using HTML: <code>&lt;a href="https://example.com"&gt;Link text&lt;/a&gt;</code>
                          </p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="important"
                            id="important"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={formData.important}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="important" className="ml-2 block text-sm text-gray-700">
                            Mark as important
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Update Notice
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setSelectedNotice(null);
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
    </div>
  );
};

export default Notices;
