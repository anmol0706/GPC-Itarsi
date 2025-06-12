import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import IconSelector, { IconOptions } from '../../components/IconSelector';

const CustomButtons = () => {
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    displayOrder: 0,
    isActive: true,
    iconType: 'lightning'
  });

  useEffect(() => {
    fetchButtons();
  }, []);

  const fetchButtons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`${config.apiUrl}/api/custom-buttons`);

      // Sort buttons by displayOrder
      const sortedButtons = [...response.data].sort((a, b) => a.displayOrder - b.displayOrder);
      setButtons(sortedButtons);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching buttons:', error);
      setError(error.response?.data?.message || 'Failed to load buttons');
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

  const handleIconChange = (iconType) => {
    setFormData({
      ...formData,
      iconType
    });
  };

  const handleAddButton = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.post(
        `${config.apiUrl}/api/admin/custom-buttons`,
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
        url: '',
        displayOrder: 0,
        isActive: true,
        iconType: 'lightning'
      });
      setShowAddModal(false);
      setSuccess('Button added successfully');

      // Refresh button list
      fetchButtons();
    } catch (error) {
      console.error('Error adding button:', error);
      setError(error.response?.data?.message || 'Failed to add button');
      setLoading(false);
    }
  };

  const handleEditButton = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.put(
        `${config.apiUrl}/api/admin/custom-buttons/${selectedButton._id}`,
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
        url: '',
        displayOrder: 0,
        isActive: true,
        iconType: 'lightning'
      });
      setSelectedButton(null);
      setShowEditModal(false);
      setSuccess('Button updated successfully');

      // Refresh button list
      fetchButtons();
    } catch (error) {
      console.error('Error updating button:', error);
      setError(error.response?.data?.message || 'Failed to update button');
      setLoading(false);
    }
  };

  const handleDeleteButton = async (buttonId) => {
    if (!window.confirm('Are you sure you want to delete this button?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.delete(`${config.apiUrl}/api/admin/custom-buttons/${buttonId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Button deleted successfully');
      // Refresh button list
      fetchButtons();
    } catch (error) {
      console.error('Error deleting button:', error);
      setError(error.response?.data?.message || 'Failed to delete button');
      setLoading(false);
    }
  };

  const openEditModal = (button) => {
    setSelectedButton(button);
    setFormData({
      title: button.title,
      url: button.url,
      displayOrder: button.displayOrder || 0,
      isActive: button.isActive !== undefined ? button.isActive : true,
      iconType: button.iconType || 'lightning'
    });
    setShowEditModal(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-semibold text-gray-900">Custom Buttons Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto admin-action-btn"
        >
          Add New Button
        </button>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Manage custom buttons that will appear between the "Our Campus" and "Latest Notices" sections on the home page.
      </p>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Close</span>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </button>
        </div>
      )}

      {success && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{success}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setSuccess('')}
          >
            <span className="sr-only">Close</span>
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </button>
        </div>
      )}

      <div className="mt-8">
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                {loading && buttons.length === 0 ? (
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading buttons...</p>
                  </div>
                ) : buttons.length === 0 ? (
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <p className="text-sm text-gray-500">No custom buttons found. Add your first button!</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            URL
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Icon
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Display Order
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {buttons.map((button) => (
                          <tr key={button._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{button.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                <a href={button.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                  {button.url}
                                </a>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md">
                                {IconOptions[button.iconType] || IconOptions.lightning}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{button.displayOrder || 0}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${button.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {button.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => openEditModal(button)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteButton(button._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile Card View */}
                    <div className="sm:hidden">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {buttons.map((button) => (
                          <div key={button._id} className="bg-white overflow-hidden shadow rounded-lg admin-table-card">
                            <div className="admin-mobile-card-header">
                              <h3 className="text-sm font-medium text-gray-900">{button.title}</h3>
                              <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${button.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {button.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="admin-mobile-card-content">
                              <div className="mb-2">
                                <span className="text-xs font-medium text-gray-500">URL:</span>
                                <p className="text-sm text-blue-600 truncate">
                                  <a href={button.url} target="_blank" rel="noopener noreferrer">
                                    {button.url}
                                  </a>
                                </p>
                              </div>
                              <div className="mb-2">
                                <span className="text-xs font-medium text-gray-500">Icon:</span>
                                <div className="flex items-center mt-1">
                                  <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md mr-1">
                                    {IconOptions[button.iconType] || IconOptions.lightning}
                                  </div>
                                  <span className="text-xs capitalize">{button.iconType || 'lightning'}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-500">Display Order:</span>
                                <p className="text-sm text-gray-900">{button.displayOrder || 0}</p>
                              </div>
                            </div>
                            <div className="admin-mobile-card-actions">
                              <button
                                onClick={() => openEditModal(button)}
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium admin-action-btn"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteButton(button._id)}
                                className="text-red-600 hover:text-red-900 text-sm font-medium admin-action-btn"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Button Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowAddModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full admin-modal">
              <form onSubmit={handleAddButton}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 admin-modal-header">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Button</h3>
                      <div className="mt-4 space-y-4 admin-form-container">
                        <div className="admin-form-group">
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Button Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.title}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label htmlFor="url" className="block text-sm font-medium text-gray-700 admin-form-label">
                            URL
                          </label>
                          <input
                            type="url"
                            name="url"
                            id="url"
                            required
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.url}
                            onChange={handleInputChange}
                            placeholder="https://example.com"
                          />
                        </div>
                        <div className="admin-form-group">
                          <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Display Order
                          </label>
                          <input
                            type="number"
                            name="displayOrder"
                            id="displayOrder"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.displayOrder}
                            onChange={handleInputChange}
                            min="0"
                          />
                          <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                        </div>
                        <div className="admin-form-group">
                          <IconSelector
                            selectedIcon={formData.iconType}
                            onChange={handleIconChange}
                          />
                          <p className="mt-1 text-xs text-gray-500">Select an icon to display with the button</p>
                        </div>
                        <div className="admin-form-group">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="isActive"
                              id="isActive"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={formData.isActive}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                              Active
                            </label>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Inactive buttons will not be displayed on the home page</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse admin-modal-footer">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm admin-action-btn"
                  >
                    Add Button
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm admin-action-btn"
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

      {/* Edit Button Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowEditModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full admin-modal">
              <form onSubmit={handleEditButton}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 admin-modal-header">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Button</h3>
                      <div className="mt-4 space-y-4 admin-form-container">
                        <div className="admin-form-group">
                          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Button Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="edit-title"
                            required
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.title}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label htmlFor="edit-url" className="block text-sm font-medium text-gray-700 admin-form-label">
                            URL
                          </label>
                          <input
                            type="url"
                            name="url"
                            id="edit-url"
                            required
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.url}
                            onChange={handleInputChange}
                            placeholder="https://example.com"
                          />
                        </div>
                        <div className="admin-form-group">
                          <label htmlFor="edit-displayOrder" className="block text-sm font-medium text-gray-700 admin-form-label">
                            Display Order
                          </label>
                          <input
                            type="number"
                            name="displayOrder"
                            id="edit-displayOrder"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md admin-form-input"
                            value={formData.displayOrder}
                            onChange={handleInputChange}
                            min="0"
                          />
                          <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                        </div>
                        <div className="admin-form-group">
                          <IconSelector
                            selectedIcon={formData.iconType}
                            onChange={handleIconChange}
                          />
                          <p className="mt-1 text-xs text-gray-500">Select an icon to display with the button</p>
                        </div>
                        <div className="admin-form-group">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="isActive"
                              id="edit-isActive"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={formData.isActive}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="edit-isActive" className="ml-2 block text-sm text-gray-700">
                              Active
                            </label>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Inactive buttons will not be displayed on the home page</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse admin-modal-footer">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm admin-action-btn"
                  >
                    Update Button
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm admin-action-btn"
                    onClick={() => setShowEditModal(false)}
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

export default CustomButtons;
