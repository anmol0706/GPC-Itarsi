import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import { FaTrash, FaFile, FaFileImage, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileAlt, FaEye, FaDownload, FaTimesCircle, FaUpload, FaCloudUploadAlt } from 'react-icons/fa';

const FileManager = () => {
  const { token } = useAuth();
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDirectory, setActiveDirectory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDirectory, setUploadDirectory] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Fallback to localStorage if token is not in context
  const getToken = () => token || localStorage.getItem('token');

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // Fetch files from the server
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const currentToken = getToken();

      const response = await axios.get(`${config.apiUrl}/api/admin/files`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      setFiles(response.data.directories);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files. Please try again later.');
      setLoading(false);
    }
  };

  // Handle file deletion
  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    try {
      setDeleteLoading(true);
      const currentToken = getToken();

      // For Cloudinary, we need to use the public_id for deletion
      const publicId = selectedFile.public_id || selectedFile.name;

      await axios.delete(`${config.apiUrl}/api/admin/files/${selectedFile.directory}/${encodeURIComponent(publicId)}`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      // Refresh the file list
      await fetchFiles();

      // Close the modal
      setShowDeleteModal(false);
      setSelectedFile(null);
      setDeleteLoading(false);
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file. Please try again later.');
      setDeleteLoading(false);
    }
  };

  // Get file icon based on file extension
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage className="text-blue-500" />;
      case 'pdf':
        return <FaFilePdf className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-700" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="text-green-600" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="text-orange-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  // Check if file is previewable
  const isPreviewable = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const previewableExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'md', 'html', 'css', 'js'];
    return previewableExtensions.includes(extension);
  };

  // Handle file preview
  const handlePreview = (file) => {
    // For Cloudinary files, the path is already the full secure_url
    console.log('Preview file:', file);

    // Make sure we have a valid URL for preview
    let previewUrl = file.path;

    // If the URL doesn't start with http, it might be a relative path
    if (previewUrl && !previewUrl.startsWith('http')) {
      previewUrl = `${config.apiUrl}/uploads/${file.directory}/${file.name}`;
    }

    setPreviewFile({
      ...file,
      url: previewUrl,
      extension: file.name.split('.').pop().toLowerCase()
    });

    console.log(`Preview URL: ${previewUrl}`);
    setShowPreviewModal(true);
  };

  // Get preview content based on file type
  const getPreviewContent = () => {
    if (!previewFile) return null;

    const extension = previewFile.extension;

    // Image preview
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      // For Cloudinary images, we can use transformations to optimize the preview
      let optimizedUrl = previewFile.url;

      // If it's a Cloudinary URL, add transformations for better preview
      if (optimizedUrl && optimizedUrl.includes('cloudinary.com')) {
        // Extract the base URL and add transformations for better viewing
        // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
        // Change to: https://res.cloudinary.com/cloud_name/image/upload/c_scale,w_1000,q_auto/v1234567890/folder/filename.jpg

        const urlParts = optimizedUrl.split('/upload/');
        if (urlParts.length === 2) {
          optimizedUrl = `${urlParts[0]}/upload/c_scale,w_1000,q_auto/${urlParts[1]}`;
        }
      }

      console.log('Optimized image URL for preview:', optimizedUrl);

      return (
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <img
              src={optimizedUrl}
              alt={previewFile.name}
              className="max-w-full max-h-[70vh] object-contain"
              onError={(e) => {
                console.error('Image failed to load:', optimizedUrl);
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAxMmMwIDYuNjIzLTUuMzc3IDEyLTEyIDEycy0xMi01LjM3Ny0xMi0xMiA1LjM3Ny0xMiAxMi0xMiAxMiA1LjM3NyAxMiAxMnptLTEgMGMwIDYuMDcxLTQuOTI5IDExLTExIDExcy0xMS00LjkyOS0xMS0xMSA0LjkyOS0xMSAxMS0xMSAxMSA0LjkyOSAxMSAxMXptLTExLjUgNC4wMDFoMXYtOC4wMDJoLTF2OC4wMDJ6bS0xLjE2Ni0xMS4wMDFjMC0uNTUyLS40NDgtMS0xLTFzLTEgLjQ0OC0xIDEgLjQ0OCAxIDEgMSAxLS40NDggMS0xem0tNC4wMDEgNWgxdjRoLTF2LTR6Ii8+PC9zdmc+';

                // Add error message below the image
                const errorDiv = document.createElement('div');
                errorDiv.className = 'text-red-500 text-sm mt-2';
                errorDiv.textContent = 'Error loading image. The file may be missing or corrupted.';
                e.target.parentNode.appendChild(errorDiv);
              }}
            />
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p className="mb-2">File URL: <a href={previewFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{previewFile.url}</a></p>
            <div className="flex space-x-4 mt-2">
              <a
                href={previewFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 flex items-center"
              >
                <FaDownload className="mr-2" /> Download original image
              </a>

              {previewFile.url && previewFile.url.includes('cloudinary.com') && (
                <a
                  href={previewFile.url.replace('/upload/', '/upload/fl_attachment/')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-700 flex items-center"
                >
                  <FaDownload className="mr-2" /> Force download
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }

    // PDF preview
    if (extension === 'pdf') {
      // For Cloudinary PDFs, we can use transformations to optimize the preview
      let optimizedUrl = previewFile.url;
      let viewerUrl = previewFile.url;

      // If it's a Cloudinary URL, we can use the Cloudinary PDF viewer
      if (optimizedUrl && optimizedUrl.includes('cloudinary.com')) {
        // For PDFs, we can use Cloudinary's PDF viewer
        const urlParts = optimizedUrl.split('/upload/');
        if (urlParts.length === 2) {
          // Add fl_attachment for direct download link
          optimizedUrl = `${urlParts[0]}/upload/fl_attachment/${urlParts[1]}`;

          // For viewing, use the PDF viewer transformation
          viewerUrl = `${urlParts[0]}/image/upload/fl_attachment/v1/fl_pdf.resource_type,q_auto/${urlParts[1]}`;
        }
      }

      console.log('PDF viewer URL:', viewerUrl);

      return (
        <div className="flex flex-col w-full">
          <div className="w-full h-[70vh]">
            <iframe
              src={viewerUrl}
              title={previewFile.name}
              className="w-full h-full border-0"
              onError={(e) => {
                console.error('PDF failed to load:', viewerUrl);
                // Create a fallback message
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'bg-gray-100 p-4 rounded-md text-center';
                fallbackDiv.innerHTML = `
                  <div class="text-red-500 mb-4">PDF preview failed to load</div>
                  <p class="mb-4">You can try opening the PDF directly:</p>
                  <a href="${previewFile.url}" target="_blank" rel="noopener noreferrer"
                     class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
                    </svg>
                    Open PDF in new tab
                  </a>
                `;

                // Replace the iframe with the fallback message
                const container = e.target.parentNode;
                container.innerHTML = '';
                container.appendChild(fallbackDiv);
              }}
            />
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p className="mb-2">File URL: <a href={previewFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{previewFile.url}</a></p>
            <div className="flex space-x-4 mt-2">
              <a
                href={previewFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 flex items-center"
              >
                <FaDownload className="mr-2" /> View PDF
              </a>

              {previewFile.url && previewFile.url.includes('cloudinary.com') && (
                <a
                  href={optimizedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-700 flex items-center"
                >
                  <FaDownload className="mr-2" /> Download PDF
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Text-based files
    if (['txt', 'md', 'html', 'css', 'js'].includes(extension)) {
      // For Cloudinary text files, we can use transformations for direct download
      let downloadUrl = previewFile.url;

      // If it's a Cloudinary URL, add attachment flag for download
      if (downloadUrl && downloadUrl.includes('cloudinary.com')) {
        const urlParts = downloadUrl.split('/upload/');
        if (urlParts.length === 2) {
          downloadUrl = `${urlParts[0]}/upload/fl_attachment/${urlParts[1]}`;
        }
      }

      return (
        <div className="flex flex-col w-full">
          <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[70vh]">
            <p className="text-sm text-gray-500 mb-2">Preview not available for text files. Please download the file to view its contents.</p>
            <div className="mt-4 p-4 border border-gray-300 rounded-md bg-white">
              <div className="flex items-center text-lg mb-2">
                {getFileIcon(previewFile.name)}
                <span className="ml-2 font-medium">{previewFile.name}</span>
              </div>
              <p className="text-sm text-gray-600">
                Size: {formatFileSize(previewFile.size || 0)}
              </p>
              <p className="text-sm text-gray-600">
                Last modified: {new Date(previewFile.updatedAt || previewFile.createdAt || Date.now()).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p className="mb-2">File URL: <a href={previewFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{previewFile.url}</a></p>
            <div className="flex space-x-4 mt-2">
              <a
                href={previewFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 flex items-center"
              >
                <FaDownload className="mr-2" /> View in browser
              </a>

              {previewFile.url && previewFile.url.includes('cloudinary.com') && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-700 flex items-center"
                >
                  <FaDownload className="mr-2" /> Download file
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default case
    return (
      <div className="flex flex-col w-full">
        <div className="text-center p-8">
          <div className="text-6xl mb-4 text-gray-400 flex justify-center">
            {getFileIcon(previewFile.name)}
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">Preview not available</p>
          <p className="text-gray-500 mb-4">This file type cannot be previewed in the browser.</p>

          <div className="mt-4 p-4 border border-gray-300 rounded-md bg-white max-w-md mx-auto">
            <div className="flex items-center text-lg mb-2 justify-center">
              {getFileIcon(previewFile.name)}
              <span className="ml-2 font-medium">{previewFile.name}</span>
            </div>
            <p className="text-sm text-gray-600">
              Size: {formatFileSize(previewFile.size || 0)}
            </p>
            <p className="text-sm text-gray-600">
              Last modified: {new Date(previewFile.updatedAt || previewFile.createdAt || Date.now()).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500 text-center">
          <p className="mb-2">File URL: <a href={previewFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{previewFile.url}</a></p>
          <div className="flex justify-center space-x-4 mt-2">
            <a
              href={previewFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 inline-flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> View in browser
            </a>

            {previewFile.url && previewFile.url.includes('cloudinary.com') && (
              <a
                href={previewFile.url.replace('/upload/', '/upload/fl_attachment/')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:text-green-700 inline-flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download file
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Filter files based on search term
  const filteredFiles = () => {
    let result = [];

    Object.keys(files).forEach(directory => {
      if (activeDirectory === 'all' || activeDirectory === directory) {
        const directoryFiles = files[directory].filter(file =>
          file.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        directoryFiles.forEach(file => {
          result.push({
            ...file,
            directory
          });
        });
      }
    });

    return result;
  };

  // Get total file count
  const getTotalFileCount = () => {
    let count = 0;
    Object.keys(files).forEach(directory => {
      count += files[directory].length;
    });
    return count;
  };

  // Get directory file count
  const getDirectoryFileCount = (directory) => {
    return files[directory] ? files[directory].length : 0;
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!uploadFile || !uploadDirectory) {
      setError('Please select a file and directory');
      return;
    }

    try {
      setUploadLoading(true);
      setUploadProgress(0);
      const currentToken = getToken();

      // Create form data
      const formData = new FormData();
      formData.append('file', uploadFile);

      // Upload the file to Cloudinary via our backend
      const response = await axios.post(
        `${config.apiUrl}/api/admin/files/${uploadDirectory}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      console.log('File uploaded successfully:', response.data);

      // Refresh the file list
      await fetchFiles();

      // Reset the form
      setUploadFile(null);
      setUploadDirectory('');
      setShowUploadModal(false);
      setUploadLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again later.');
      setUploadLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">File Manager</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-semibold text-gray-700">Uploaded Files</h2>
              <p className="text-sm text-gray-500">Manage files uploaded to Cloudinary</p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                <FaCloudUploadAlt className="mr-2" />
                Upload File
              </button>

              <div className="w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search files..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeDirectory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveDirectory('all')}
            >
              All Files ({getTotalFileCount()})
            </button>

            {Object.keys(files).map(directory => (
              <button
                key={directory}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeDirectory === directory
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveDirectory(directory)}
              >
                {directory} ({getDirectoryFileCount(directory)})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredFiles().length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <FaFile className="mx-auto text-gray-400 text-5xl mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No files found</h3>
            <p className="text-gray-500">
              {searchTerm
                ? `No files matching "${searchTerm}" were found.`
                : 'There are no files in this directory.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Directory</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFiles().map((file, index) => (
                  <tr key={`${file.directory}-${file.name}-${index}`} className="hover:bg-gray-50">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                          {getFileIcon(file.name)}
                        </div>
                        <div className="ml-4">
                          {isPreviewable(file.name) ? (
                            <button
                              onClick={() => handlePreview(file)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {file.name}
                            </button>
                          ) : (
                            <a
                              href={file.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {file.name}
                            </a>
                          )}
                          <div className="text-sm text-gray-500">{file.format || file.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{file.directory}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatFileSize(file.size || 0)}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(file.updatedAt || file.createdAt || Date.now()).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        {isPreviewable(file.name) ? (
                          <button
                            onClick={() => handlePreview(file)}
                            className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            title="Preview file"
                          >
                            <FaEye className="mr-1" /> Preview
                          </button>
                        ) : (
                          <a
                            href={file.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            title="Open file"
                          >
                            <FaDownload className="mr-1" /> Open
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setSelectedFile(file);
                            setShowDeleteModal(true);
                          }}
                          className="flex items-center px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          title="Delete file"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete the file "{selectedFile?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFile}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showPreviewModal && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                {getFileIcon(previewFile.name)}
                <span className="ml-2">{previewFile.name}</span>
                <span className="ml-3 text-sm text-gray-500">({formatFileSize(previewFile.size || 0)})</span>
              </h3>
              <div className="flex items-center space-x-2">
                <a
                  href={previewFile.url}
                  download={previewFile.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  title="Download file"
                >
                  <FaDownload className="mr-2" /> Download
                </a>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewFile(null);
                  }}
                  className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  title="Close preview"
                >
                  <FaTimesCircle className="mr-2" /> Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 p-4 rounded">
              {getPreviewContent()}
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload File to Cloudinary</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Directory
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={uploadDirectory}
                onChange={(e) => setUploadDirectory(e.target.value)}
                disabled={uploadLoading}
              >
                <option value="">Select a directory</option>
                {Object.keys(files).map(directory => (
                  <option key={directory} value={directory}>
                    {directory}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                ref={fileInputRef}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setUploadFile(e.target.files[0])}
                disabled={uploadLoading}
              />
              {uploadFile && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected file: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                </p>
              )}
            </div>

            {uploadLoading && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Uploading: {uploadProgress}%
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadDirectory('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                disabled={uploadLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={uploadLoading || !uploadFile || !uploadDirectory}
              >
                {uploadLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaCloudUploadAlt className="mr-2" />
                    Upload to Cloudinary
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
