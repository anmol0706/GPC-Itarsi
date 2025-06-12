import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import config from '../../config';
import sanitizeHtml from '../../utils/sanitizeHtml';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { isValidUrl, ensureUrlProtocol } from '../../utils/urlUtils';
import ButtonDialog from '../../components/editor/ButtonDialog';
import NoticeContent from '../../components/notices/NoticeContent';
import '../../styles/notice-buttons.css';
import '../../styles/quill-custom.css';

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

  // Button dialog state
  const [showButtonDialog, setShowButtonDialog] = useState(false);
  const [buttonDialogInitialText, setButtonDialogInitialText] = useState('');
  const [buttonDialogInitialUrl, setButtonDialogInitialUrl] = useState('');
  const quillRef = useRef(null);



  // Handle button insertion from the dialog
  const handleButtonInsert = useCallback((buttonHtml) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const range = quill.getSelection();
    if (!range) return;

    // Delete the current selection if any
    if (range.length > 0) {
      quill.deleteText(range.index, range.length);
    }

    // Insert the button HTML
    quill.clipboard.dangerouslyPasteHTML(range.index, buttonHtml);

    // Move cursor after the inserted button
    quill.setSelection(range.index + buttonHtml.length, 0);
  }, []);

  // Quill editor modules and formats configuration
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['button'],
        ['clean']
      ],
      handlers: {
        button: function() {
          // Get the Quill editor instance
          const quill = this.quill;
          const range = quill.getSelection();

          if (range) {
            // Get the selected text
            let selectedText = '';
            if (range.length > 0) {
              selectedText = quill.getText(range.index, range.length);
            }

            // Open the button dialog
            setButtonDialogInitialText(selectedText);
            setButtonDialogInitialUrl('');
            setShowButtonDialog(true);
          }
        }
      }
    }
  }), []);

  const quillFormats = useMemo(() => [
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet'
  ], []);

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

      const response = await axios.get(`${config.apiUrl}/api/notices`, {
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
    const { name, value, type, checked } = e.target || {};

    // If this is from the Quill editor (not an event object with target)
    if (e && !e.target) {
      setFormData({
        ...formData,
        content: e
      });
      return;
    }

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
        `${config.apiUrl}/api/notices`,
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
        `${config.apiUrl}/api/notices/${selectedNotice._id}`,
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

      await axios.delete(`${config.apiUrl}/api/notices/${noticeId}`, {
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
    <div className="max-w-full px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-primary-800">Notices Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-primary-500/30 text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200 w-full sm:w-auto justify-center sm:justify-start"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Notice
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-4">
        <div className="relative rounded-md shadow-sm">
          <input
            type="text"
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pr-10 text-sm sm:text-sm border-gray-300 rounded-md"
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading notices...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            {searchTerm ? 'No notices match your search criteria' : 'No notices available'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredNotices.map((notice) => (
              <li key={notice._id} className="hover:bg-gray-50 transition-colors duration-150">
                <div className="px-3 py-3 sm:px-6 sm:py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-primary-600 break-words">
                        {notice.title}
                      </p>
                      {notice.important && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error">
                          Important
                        </span>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success/10 text-success">
                        {formatDate(notice.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-col sm:flex-row sm:justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="text-sm text-gray-500 overflow-hidden">
                        <NoticeContent
                          content={notice.content}
                          maxLength={150}
                          truncate={notice.content.length > 150}
                        />
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center justify-end gap-4 text-sm text-gray-500">
                      <button
                        onClick={() => openEditModal(notice)}
                        className="flex items-center text-accent-600 hover:text-accent-800 transition-colors duration-150 px-2 py-1 rounded hover:bg-accent-50"
                        aria-label="Edit notice"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(notice._id)}
                        className="flex items-center text-error hover:text-error/80 transition-colors duration-150 px-2 py-1 rounded hover:bg-red-50"
                        aria-label="Delete notice"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-2 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm"
              aria-hidden="true"
              onClick={() => setShowAddModal(false)}
            ></div>

            {/* Modal positioning trick */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full mx-2 sm:mx-auto">
              <div className="absolute top-0 right-0 pt-3 pr-3 block sm:hidden">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowAddModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddNotice}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-primary-800 mb-2">Add New Notice</h3>
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
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm text-sm border-gray-300 rounded-md"
                            value={formData.title}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                            Content
                          </label>
                          <div className="mt-1 futuristic-editor">
                            <ReactQuill
                              ref={quillRef}
                              theme="snow"
                              value={formData.content}
                              onChange={handleInputChange}
                              modules={quillModules}
                              formats={quillFormats}
                              className="h-40 mb-10"
                            />
                          </div>
                          <div className="mt-12 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              <p>Use the button option <span className="inline-block px-1 py-0.5 bg-gray-100 rounded">Button</span> to add styled buttons with links</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="important"
                            id="important"
                            className="h-5 w-5 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
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
                <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto sm:text-sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-primary-500/30 shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add Notice
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}



      {/* Button Dialog */}
      <ButtonDialog
        isOpen={showButtonDialog}
        onClose={() => setShowButtonDialog(false)}
        onInsert={handleButtonInsert}
        initialText={buttonDialogInitialText}
        initialUrl={buttonDialogInitialUrl}
      />

      {/* Edit Notice Modal */}
      {showEditModal && selectedNotice && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-2 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm"
              aria-hidden="true"
              onClick={() => {
                setSelectedNotice(null);
                setShowEditModal(false);
              }}
            ></div>

            {/* Modal positioning trick */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full mx-2 sm:mx-auto">
              <div className="absolute top-0 right-0 pt-3 pr-3 block sm:hidden">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => {
                    setSelectedNotice(null);
                    setShowEditModal(false);
                  }}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditNotice}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-primary-800 mb-2">Edit Notice</h3>
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
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm text-sm border-gray-300 rounded-md"
                            value={formData.title}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                            Content
                          </label>
                          <div className="mt-1 futuristic-editor">
                            <ReactQuill
                              ref={quillRef}
                              theme="snow"
                              value={formData.content}
                              onChange={handleInputChange}
                              modules={quillModules}
                              formats={quillFormats}
                              className="h-40 mb-10"
                            />
                          </div>
                          <div className="mt-12 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              <p>Use the button option <span className="inline-block px-1 py-0.5 bg-gray-100 rounded">Button</span> to add styled buttons with links</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="important"
                            id="important"
                            className="h-5 w-5 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
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
                <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setSelectedNotice(null);
                      setShowEditModal(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-primary-500/30 shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Update Notice
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
