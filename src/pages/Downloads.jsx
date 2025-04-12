import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import { API_URL } from '../config/api';

const Downloads = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('downloads'); // 'downloads' or 'links'
  const [selectedDocType, setSelectedDocType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (documents.length > 0) {
      // Apply filters
      let filtered = documents;

      // First filter by tab type
      if (activeTab === 'downloads') {
        filtered = filtered.filter(doc => doc.type !== 'drive_link');
      } else { // links tab
        filtered = filtered.filter(doc => doc.type === 'drive_link');
      }

      if (selectedDocType && activeTab === 'downloads') {
        filtered = filtered.filter(doc => doc.type === selectedDocType);
      }

      if (selectedCategory) {
        filtered = filtered.filter(doc => doc.category === selectedCategory);
      }

      if (searchTerm) {
        filtered = filtered.filter(
          doc =>
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setFilteredDocuments(filtered);
    }
  }, [documents, searchTerm, selectedDocType, selectedCategory, activeTab]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      // Try to fetch from API, fall back to mock data if it fails
      let response;
      try {
        response = await axiosInstance.get('/api/documents');
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Fall back to mock data
        response = {
          data: [
            {
              _id: '1',
              title: 'College Newsletter - April 2025',
              description: 'Monthly newsletter with college updates and events',
              type: 'newsletter',
              category: 'general',
              fileType: 'application/pdf',
              uploadDate: new Date().toISOString(),
              fileExists: true,
              filePath: 'newsletters/newsletter-april-2025.pdf'
            },
            {
              _id: '2',
              title: 'Admission Form 2025-26',
              description: 'Application form for new admissions',
              type: 'form',
              category: 'admission',
              fileType: 'application/pdf',
              uploadDate: new Date().toISOString(),
              fileExists: true,
              filePath: 'forms/admission-form-2025.pdf'
            },
            {
              _id: '3',
              title: 'Scholarship Application',
              description: 'Form to apply for various scholarship programs',
              type: 'application',
              category: 'scholarship',
              fileType: 'application/pdf',
              uploadDate: new Date().toISOString(),
              fileExists: true,
              filePath: 'applications/scholarship-application.pdf'
            },
            {
              _id: '4',
              title: 'Academic Calendar 2025-26',
              description: 'Complete academic calendar with important dates',
              type: 'drive_link',
              category: 'academic',
              uploadDate: new Date().toISOString(),
              driveUrl: 'https://docs.google.com/document/d/example',
              fileExists: true
            }
          ]
        };
      }

      // Process the documents to add file type icons
      const processedDocuments = response.data.map(doc => {
        let fileIcon = 'file-text';
        let fileExists = true;

        if (doc.fileType) {
          if (doc.fileType.includes('pdf')) {
            fileIcon = 'file-pdf';
          } else if (doc.fileType.includes('word') || doc.fileType.includes('doc')) {
            fileIcon = 'file-word';
          } else if (doc.fileType.includes('sheet') || doc.fileType.includes('excel') || doc.fileType.includes('xls')) {
            fileIcon = 'file-excel';
          } else if (doc.fileType.includes('presentation') || doc.fileType.includes('powerpoint') || doc.fileType.includes('ppt')) {
            fileIcon = 'file-powerpoint';
          } else if (doc.fileType.includes('image')) {
            fileIcon = 'image';
          } else if (doc.fileType.includes('zip') || doc.fileType.includes('rar') || doc.fileType.includes('tar')) {
            fileIcon = 'archive';
          }
        }

        return {
          ...doc,
          fileExists,
          fileIcon
        };
      });

      setDocuments(processedDocuments);
      setFilteredDocuments(processedDocuments.filter(doc =>
        activeTab === 'downloads' ? doc.type !== 'drive_link' : doc.type === 'drive_link'
      ));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load downloadable documents');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDocType('');
    setSelectedCategory('');

    // Filter documents based on active tab
    if (activeTab === 'downloads') {
      setFilteredDocuments(documents.filter(doc => doc.type !== 'drive_link'));
    } else {
      setFilteredDocuments(documents.filter(doc => doc.type === 'drive_link'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-primary-600 sm:text-4xl">
          Resources
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-secondary-600">
          Access downloadable documents and external resource links
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setActiveTab('downloads')}
            className={`px-6 py-3 text-sm font-medium rounded-l-lg ${activeTab === 'downloads'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-primary-600 hover:bg-primary-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Downloads
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`px-6 py-3 text-sm font-medium rounded-r-lg ${activeTab === 'links'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-primary-600 hover:bg-primary-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            External Links
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-primary-600 mb-4">Search & Filter</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-secondary-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                placeholder="Search by title or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="docType" className="block text-sm font-medium text-secondary-700 mb-1">
                Document Type
              </label>
              <select
                id="docType"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
              >
                <option value="">All Types</option>
                {activeTab === 'downloads' ? (
                  <>
                    <option value="form">Forms</option>
                    <option value="application">Applications</option>
                    <option value="newsletter">Newsletters</option>
                  </>
                ) : null}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="general">General</option>
                <option value="admission">Admission</option>
                <option value="examination">Examination</option>
                <option value="scholarship">Scholarship</option>
                <option value="academic">Academic</option>
                <option value="administrative">Administrative</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-primary-600">
            {activeTab === 'downloads' ? 'Downloadable Documents' : 'External Resource Links'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'downloads'
              ? 'Download forms, applications, and other important documents'
              : 'Access external resources and drive links'}
          </p>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Loading documents...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl font-medium text-red-600 mb-2">{error}</p>
            <button
              onClick={() => fetchDocuments()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-secondary-50 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xl font-medium text-secondary-600 mb-2">
              {searchTerm || selectedDocType || selectedCategory
                ? 'No documents match your search criteria'
                : activeTab === 'downloads'
                  ? 'No downloadable documents available'
                  : 'No external links available'}
            </p>
            {(searchTerm || selectedDocType || selectedCategory) && (
              <p className="text-secondary-500 mb-4">Try adjusting your filters or search terms</p>
            )}
            {(searchTerm || selectedDocType || selectedCategory) && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <ul className={`divide-y divide-secondary-200 ${activeTab === 'links' ? 'bg-orange-50' : ''}`}>
            {filteredDocuments.map((doc) => (
              <li key={doc._id} className="p-6 hover:bg-secondary-50 transition-colors duration-150 border-b border-secondary-100 last:border-b-0">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div className="flex-1">
                    <div className="flex items-start">
                      {doc.fileExists ? (
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center mr-4">
                          {doc.fileIcon === 'file-pdf' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                          {doc.fileIcon === 'file-word' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                          {doc.fileIcon === 'file-excel' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                          {doc.fileIcon === 'file-powerpoint' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                          {doc.fileIcon === 'image' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                          {doc.fileIcon === 'archive' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                          )}
                          {doc.fileIcon === 'file-text' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          {doc.type === 'drive_link' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          )}
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-primary-600">{doc.title}</h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {doc.type && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {doc.type === 'form' ? 'Form' :
                             doc.type === 'application' ? 'Application' :
                             doc.type === 'drive_link' ? 'Drive Link' : 'Newsletter'}
                            </span>
                          )}
                          {doc.category && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
                            </span>
                          )}
                          {doc.fileExists && doc.fileType && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {doc.fileType}
                            </span>
                          )}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                            {formatDate(doc.uploadDate)}
                          </span>
                        </div>
                        {doc.description && (
                          <p className="mt-2 text-sm text-secondary-600">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                    {doc.type === 'drive_link' ? (
                      <a
                        href={doc.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hero-btn programs-btn inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 transition-all duration-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open Link
                      </a>
                    ) : doc.fileExists ? (
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          // Check if it's a mock document
                          if (doc._id.toString().length === 1) {
                            // For mock data, just show an alert
                            alert('This is a mock document. In production, this would download the actual file.');
                          } else {
                            // Use window.open to download with CORS headers
                            window.open(`${API_URL}/api/download/document/${doc._id}`, '_blank');
                          }
                        }}
                        href="#"
                        className="hero-btn programs-btn inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 transition-all duration-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                    ) : (
                      <div className="text-center">
                        <span className="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-500 bg-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          File not available
                        </span>
                        <p className="mt-2 text-xs text-gray-500">Please contact the administrator</p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Downloads;
