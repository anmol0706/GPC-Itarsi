import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const StudyMaterials = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (studyMaterials.length > 0) {
      let filtered = studyMaterials;

      // Filter by subject
      if (selectedSubject !== 'all') {
        filtered = filtered.filter(material => material.subject === selectedSubject);
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(
          material =>
            material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (material.description && material.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (material.teacherName && material.teacherName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setFilteredMaterials(filtered);
    }
  }, [selectedSubject, searchTerm, studyMaterials]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      // Fetch student profile
      const profileRes = await axios.get('http://localhost:5001/api/students/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStudentData(profileRes.data);

      // Fetch study materials directly
      const materialsRes = await axios.get('http://localhost:5001/api/study-materials', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Process study materials
      const allMaterials = materialsRes.data;
      const subjectsSet = new Set();

      // Add subject to the set and ensure teacher names
      allMaterials.forEach(material => {
        if (material.subject) {
          subjectsSet.add(material.subject);
        } else {
          subjectsSet.add('General');
        }
      });

      // Verify file URLs by making HEAD requests
      const materialsWithFileStatus = await Promise.all(
        allMaterials.map(async (material) => {
          try {
            if (material.fileUrl) {
              await axios.head(`http://localhost:5001/uploads/study-materials/${material.fileUrl}`);
              return { ...material, fileExists: true };
            }
            return { ...material, fileExists: false };
          } catch (error) {
            console.warn(`File not found for material: ${material.title}`);
            return { ...material, fileExists: false };
          }
        })
      );

      // Sort by upload date (newest first)
      materialsWithFileStatus.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

      setStudyMaterials(materialsWithFileStatus);
      setFilteredMaterials(materialsWithFileStatus);
      setSubjects(Array.from(subjectsSet));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching study materials:', error);
      setError(error.response?.data?.message || 'Failed to load study materials');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Study Materials</h1>

      {loading ? (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : (
        <>
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                    Search Materials
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      name="search"
                      id="search"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Search by title, description, or teacher"
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

                <div>
                  <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700">
                    Filter by Subject
                  </label>
                  <select
                    id="subject-filter"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="all">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {filteredMaterials.length === 0 ? (
              <div className="bg-white px-4 py-12 text-center shadow rounded-lg text-gray-500">
                {searchTerm || selectedSubject !== 'all' ? 'No study materials match your search criteria' : 'No study materials available for your class'}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMaterials.map((material) => (
                  <div key={material._id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium text-gray-900 truncate">{material.title}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {material.subject}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-500 flex-grow">
                          {material.description || 'No description provided'}
                        </p>

                        <div className="mt-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>By: {material.teacherName}</span>
                          </div>

                          <div className="flex items-center mt-1">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Uploaded: {formatDate(material.uploadDate)}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          {material.fileExists ? (
                            <a
                              href={`http://localhost:5001/uploads/study-materials/${material.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                              Download
                            </a>
                          ) : (
                            <span className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-gray-100">
                              File not available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudyMaterials;
