import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { toast } from 'react-toastify';

const CustomButtons = () => {
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    icon: 'link',
    color: 'blue'
  });

  // Available icons and colors for selection
  const availableIcons = [
    { value: 'link', label: 'Link' },
    { value: 'user-group', label: 'Users' },
    { value: 'book-open', label: 'Book' },
    { value: 'calendar', label: 'Calendar' }
  ];

  const availableColors = [
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'red', label: 'Red' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'indigo', label: 'Indigo' },
    { value: 'purple', label: 'Purple' },
    { value: 'pink', label: 'Pink' }
  ];

  useEffect(() => {
    fetchButtons();
  }, []);

  const fetchButtons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/custom-buttons`);
      if (response.data && Array.isArray(response.data)) {
        // Sort buttons by order
        const sortedButtons = [...response.data].sort((a, b) => a.order - b.order);
        setButtons(sortedButtons);
      }
    } catch (error) {
      console.error('Error fetching custom buttons:', error);
      toast.error('Failed to load custom buttons');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      icon: 'link',
      color: 'blue'
    });
    setSelectedButton(null);
  };

  const openEditModal = (button) => {
    setSelectedButton(button);
    setFormData({
      title: button.title,
      url: button.url,
      icon: button.icon || 'link',
      color: button.color || 'blue'
    });
    setShowEditModal(true);
  };

  const handleAddButton = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url) {
      toast.error('Title and URL are required');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/custom-buttons`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data) {
        toast.success('Custom button added successfully');
        fetchButtons();
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding custom button:', error);
      toast.error('Failed to add custom button');
    }
  };

  const handleUpdateButton = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url) {
      toast.error('Title and URL are required');
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/api/custom-buttons/${selectedButton._id}`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data) {
        toast.success('Custom button updated successfully');
        fetchButtons();
        setShowEditModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating custom button:', error);
      toast.error('Failed to update custom button');
    }
  };

  const handleDeleteButton = async (buttonId) => {
    if (!window.confirm('Are you sure you want to delete this button?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/custom-buttons/${buttonId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast.success('Custom button deleted successfully');
      fetchButtons();
    } catch (error) {
      console.error('Error deleting custom button:', error);
      toast.error('Failed to delete custom button');
    }
  };

  const handleReorderButtons = async (buttonId, newOrder) => {
    try {
      const button = buttons.find(b => b._id === buttonId);
      if (!button) return;

      await axios.put(`${API_URL}/api/custom-buttons/${buttonId}`, 
        { order: newOrder },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      fetchButtons();
    } catch (error) {
      console.error('Error reordering buttons:', error);
      toast.error('Failed to reorder buttons');
    }
  };

  const moveButtonUp = (index) => {
    if (index === 0) return; // Already at the top
    const buttonToMove = buttons[index];
    const buttonAbove = buttons[index - 1];
    handleReorderButtons(buttonToMove._id, buttonAbove.order);
    handleReorderButtons(buttonAbove._id, buttonToMove.order);
  };

  const moveButtonDown = (index) => {
    if (index === buttons.length - 1) return; // Already at the bottom
    const buttonToMove = buttons[index];
    const buttonBelow = buttons[index + 1];
    handleReorderButtons(buttonToMove._id, buttonBelow.order);
    handleReorderButtons(buttonBelow._id, buttonToMove.order);
  };

  // Function to render icon preview
  const renderIconPreview = (iconName) => {
    switch (iconName) {
      case 'user-group':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'book-open':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'calendar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'link':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Custom Buttons Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Add New Button
        </button>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Manage custom buttons that appear on the home page between Facilities and Announcements sections.
      </p>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          {buttons.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-500">No custom buttons found. Click "Add New Button" to create one.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {buttons.map((button, index) => (
                <li key={button._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-md bg-${button.color || 'blue'}-100 text-${button.color || 'blue'}-600 mr-4`}>
                        {renderIconPreview(button.icon)}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{button.title}</h3>
                        <p className="text-sm text-gray-500">URL: {button.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveButtonUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded-full ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveButtonDown(index)}
                        disabled={index === buttons.length - 1}
                        className={`p-1 rounded-full ${index === buttons.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openEditModal(button)}
                        className="p-1 rounded-full text-blue-600 hover:bg-blue-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteButton(button._id)}
                        className="p-1 rounded-full text-red-600 hover:bg-red-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Add Button Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowAddModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Custom Button</h3>
                <form onSubmit={handleAddButton}>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700">URL</label>
                    <input
                      type="text"
                      name="url"
                      id="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="icon" className="block text-sm font-medium text-gray-700">Icon</label>
                    <div className="mt-1 flex items-center">
                      <select
                        name="icon"
                        id="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      >
                        {availableIcons.map(icon => (
                          <option key={icon.value} value={icon.value}>{icon.label}</option>
                        ))}
                      </select>
                      <div className="ml-3 p-2 bg-gray-100 rounded-md">
                        {renderIconPreview(formData.icon)}
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
                    <select
                      name="color"
                      id="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    >
                      {availableColors.map(color => (
                        <option key={color.value} value={color.value}>{color.label}</option>
                      ))}
                    </select>
                    <div className={`mt-2 p-2 rounded-md bg-${formData.color}-100 text-${formData.color}-600 inline-block`}>
                      Color preview
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                    >
                      Add Button
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Button Modal */}
      {showEditModal && selectedButton && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowEditModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Custom Button</h3>
                <form onSubmit={handleUpdateButton}>
                  <div className="mb-4">
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      id="edit-title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-url" className="block text-sm font-medium text-gray-700">URL</label>
                    <input
                      type="text"
                      name="url"
                      id="edit-url"
                      value={formData.url}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-icon" className="block text-sm font-medium text-gray-700">Icon</label>
                    <div className="mt-1 flex items-center">
                      <select
                        name="icon"
                        id="edit-icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      >
                        {availableIcons.map(icon => (
                          <option key={icon.value} value={icon.value}>{icon.label}</option>
                        ))}
                      </select>
                      <div className="ml-3 p-2 bg-gray-100 rounded-md">
                        {renderIconPreview(formData.icon)}
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-color" className="block text-sm font-medium text-gray-700">Color</label>
                    <select
                      name="color"
                      id="edit-color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    >
                      {availableColors.map(color => (
                        <option key={color.value} value={color.value}>{color.label}</option>
                      ))}
                    </select>
                    <div className={`mt-2 p-2 rounded-md bg-${formData.color}-100 text-${formData.color}-600 inline-block`}>
                      Color preview
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                    >
                      Update Button
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomButtons;
