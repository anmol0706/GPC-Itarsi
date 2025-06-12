import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';

const EventModal = ({ isOpen, onClose, mode, onEdit, selectedDate }) => {
  const { selectedEvent, addEvent, updateEvent, deleteEvent } = useCalendar();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    location: '',
    type: 'class',
    forClass: user?.role === 'student' ? user?.class : 'all',
    forSubject: '',
    color: '#4CAF50',
    isRecurring: false,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [1], // Monday
      endDate: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form data based on mode and selected event/date
  useEffect(() => {
    if (mode === 'view' || mode === 'edit') {
      if (selectedEvent) {
        const startDate = new Date(selectedEvent.startDate);
        const endDate = new Date(selectedEvent.endDate);

        setFormData({
          title: selectedEvent.title || '',
          description: selectedEvent.description || '',
          startDate: formatDateForInput(startDate),
          startTime: formatTimeForInput(startDate),
          endDate: formatDateForInput(endDate),
          endTime: formatTimeForInput(endDate),
          location: selectedEvent.location || '',
          type: selectedEvent.type || 'class',
          forClass: selectedEvent.forClass || 'all',
          forSubject: selectedEvent.forSubject || '',
          color: selectedEvent.color || '#4CAF50',
          isRecurring: selectedEvent.isRecurring || false,
          recurrencePattern: selectedEvent.recurrencePattern || {
            frequency: 'weekly',
            daysOfWeek: [1],
            endDate: ''
          }
        });
      }
    } else if (mode === 'add' && selectedDate) {
      const formattedDate = formatDateForInput(selectedDate);
      setFormData(prev => ({
        ...prev,
        startDate: formattedDate,
        endDate: formattedDate,
        recurrencePattern: {
          ...prev.recurrencePattern,
          endDate: formatDateForInput(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 3, selectedDate.getDate()))
        }
      }));
    }
  }, [mode, selectedEvent, selectedDate]);

  // Helper functions for date/time formatting
  function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
  }

  function formatTimeForInput(date) {
    return date.toTimeString().slice(0, 5);
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      // Handle nested properties (recurrencePattern)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name === 'isRecurring') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Combine date and time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      // Prepare event data
      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        location: formData.location,
        type: formData.type,
        forClass: formData.forClass,
        forSubject: formData.forSubject,
        color: formData.color,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.isRecurring ? {
          ...formData.recurrencePattern,
          endDate: new Date(`${formData.recurrencePattern.endDate}T23:59:59`).toISOString()
        } : null
      };

      if (mode === 'add') {
        await addEvent(eventData);
      } else if (mode === 'edit') {
        await updateEvent(selectedEvent._id, eventData);
      }

      onClose();
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle event deletion
  const handleDelete = async () => {
    if (!selectedEvent) return;

    setLoading(true);
    setError(null);

    try {
      await deleteEvent(selectedEvent._id);
      onClose();
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Event type options
  const eventTypes = [
    { value: 'class', label: 'Class' },
    { value: 'exam', label: 'Exam' },
    { value: 'lab', label: 'Lab' },
    { value: 'event', label: 'Event' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'holiday', label: 'Holiday' }
  ];

  // Color options
  const colorOptions = [
    { value: '#4CAF50', label: 'Green' },
    { value: '#2196F3', label: 'Blue' },
    { value: '#F44336', label: 'Red' },
    { value: '#FF9800', label: 'Orange' },
    { value: '#9C27B0', label: 'Purple' },
    { value: '#607D8B', label: 'Gray' }
  ];

  // Check if user can edit/delete events
  // Only admins and teachers can edit/delete events
  // Admins can edit any event, teachers can only edit their own events
  const canEditEvent = (user?.role === 'admin') ||
                      (user?.role === 'teacher' && selectedEvent && selectedEvent.createdBy === user?.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Modal header */}
          <div className="bg-primary-100 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-primary-800">
                {mode === 'view' ? 'Event Details' : mode === 'add' ? 'Add Event' : 'Edit Event'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal content */}
          <div className="px-4 py-3">
            {showDeleteConfirm ? (
              <div className="text-center py-4">
                <svg className="mx-auto h-12 w-12 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-primary-800">Delete Event</h3>
                <p className="mt-1 text-sm text-primary-600">
                  Are you sure you want to delete this event? This action cannot be undone.
                </p>
                <div className="mt-4 flex justify-center space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-error border border-error/30 rounded-md hover:bg-error/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ) : mode === 'view' ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-semibold" style={{ color: selectedEvent?.color }}>
                    {selectedEvent?.title}
                  </h4>
                  <div className="mt-1 flex items-center text-sm text-primary-600">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      {new Date(selectedEvent?.startDate).toLocaleDateString()} {new Date(selectedEvent?.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' '} - {' '}
                      {new Date(selectedEvent?.endDate).toLocaleDateString()} {new Date(selectedEvent?.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {selectedEvent?.location && (
                  <div className="flex items-start">
                    <svg className="flex-shrink-0 mt-0.5 mr-1.5 h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-primary-700">{selectedEvent?.location}</span>
                  </div>
                )}

                {selectedEvent?.description && (
                  <div className="mt-2">
                    <p className="text-sm text-primary-700 whitespace-pre-line">{selectedEvent?.description}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${selectedEvent?.color}20`, color: selectedEvent?.color }}>
                    {eventTypes.find(t => t.value === selectedEvent?.type)?.label || selectedEvent?.type}
                  </span>

                  {selectedEvent?.forClass && selectedEvent.forClass !== 'all' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {selectedEvent.forClass}
                    </span>
                  )}

                  {selectedEvent?.forSubject && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                      {selectedEvent.forSubject}
                    </span>
                  )}

                  {selectedEvent?.isRecurring && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                      Recurring
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4 p-2 bg-error/10 border border-error/30 text-error rounded">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date *</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time *</label>
                      <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date *</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time *</label>
                      <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">Event Type *</label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        {eventTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
                      <select
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        {colorOptions.map(color => (
                          <option key={color.value} value={color.value}>{color.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="forClass" className="block text-sm font-medium text-gray-700">For Class</label>
                      <input
                        type="text"
                        id="forClass"
                        name="forClass"
                        value={formData.forClass}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="forSubject" className="block text-sm font-medium text-gray-700">For Subject</label>
                      <input
                        type="text"
                        id="forSubject"
                        name="forSubject"
                        value={formData.forSubject}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={handleChange}
                      className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
                      Recurring Event
                    </label>
                  </div>

                  {formData.isRecurring && (
                    <div className="pl-6 space-y-4 border-l-2 border-gray-200">
                      <div>
                        <label htmlFor="recurrencePattern.frequency" className="block text-sm font-medium text-gray-700">Frequency</label>
                        <select
                          id="recurrencePattern.frequency"
                          name="recurrencePattern.frequency"
                          value={formData.recurrencePattern.frequency}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="recurrencePattern.endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                          type="date"
                          id="recurrencePattern.endDate"
                          name="recurrencePattern.endDate"
                          value={formData.recurrencePattern.endDate}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Modal footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {mode === 'view' ? (
              <div className="sm:flex sm:flex-row-reverse">
                {canEditEvent && (
                  <>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-red-400/30 shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={onEdit}
                    >
                      Edit
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-primary-500/30 shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : mode === 'add' ? 'Add Event' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

EventModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['view', 'add', 'edit']).isRequired,
  onEdit: PropTypes.func,
  selectedDate: PropTypes.instanceOf(Date)
};

export default EventModal;
