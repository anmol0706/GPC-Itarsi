import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import '../styles/faculty.css';

// Import SEO components
import SEO from '../components/SEO';
import SchemaMarkup from '../components/SchemaMarkup';
import { generateBreadcrumbSchema, generatePersonSchema } from '../utils/schemaMarkup';

// Helper function to map department abbreviations to full names
const mapDepartment = (dept) => {
  if (!dept) return 'General';

  const departmentMap = {
    'CS': 'Computer Science',
    'ME': 'Mechanical Engineering',
    'EE': 'Electrical Engineering',
    'ET': 'Electronics and Telecommunication',
    'CE': 'Civil Engineering'
  };

  return departmentMap[dept] || dept;
};

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Generate breadcrumb schema for the faculty page
  const breadcrumbSchema = generateBreadcrumbSchema([
    {
      name: 'Home',
      url: 'https://gpc-itarsi-9cl7.onrender.com/'
    },
    {
      name: 'Faculty',
      url: 'https://gpc-itarsi-9cl7.onrender.com/faculty'
    }
  ]);

  useEffect(() => {
    fetchFaculty();
  }, []);

  // Fetch faculty data from API with fallback to mock data
  const fetchFaculty = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching faculty data from:', `${config.apiUrl}/api/faculty`);

      // Try to fetch real faculty data from the API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await axios.get(`${config.apiUrl}/api/faculty`, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.data && response.data.length > 0) {
          // Process the data to ensure all required fields are present and formatted correctly
          const processedData = response.data.map(teacher => ({
            ...teacher,
            // Map department abbreviations to full names
            department: mapDepartment(teacher.department),
            subjects: teacher.subjects || [],
            designation: teacher.designation || `Faculty, ${mapDepartment(teacher.department)}`,
            qualification: teacher.qualification || 'M.Tech',
            experience: teacher.experience || '5+ years'
          }));

          setFaculty(processedData);
          console.log('Faculty data loaded:', processedData);
        } else {
          console.log('No faculty data found in API response, using fallback data');
          useFallbackData();
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          console.error('Faculty data fetch timed out after 10 seconds');
          setError('Request timed out. Using fallback data.');
        } else {
          console.error('Error fetching faculty data:', fetchError);
          setError(fetchError.message || 'Failed to fetch faculty data');
        }

        // Use fallback data if API call fails
        useFallbackData();
      }
    } catch (error) {
      console.error('Unexpected error in fetchFaculty:', error);
      setError(error.message || 'An unexpected error occurred');
      useFallbackData();
    } finally {
      setLoading(false);
    }
  };

  // Function to use fallback data when API fails
  const useFallbackData = () => {
    console.log('Using fallback faculty data');
    const fallbackFaculty = [
      {
        _id: 'fallback1',
        name: 'Dr. Rajesh Kumar',
        department: 'Computer Science',
        designation: 'Professor',
        qualification: 'Ph.D. in Computer Science',
        experience: '15 years',
        subjects: ['Data Structures', 'Algorithms', 'Database Management'],
        profilePicture: null,
        email: 'rajesh.kumar@gpcitarsi.edu.in'
      },
      {
        _id: 'fallback2',
        name: 'Prof. Sunita Verma',
        department: 'Electrical Engineering',
        designation: 'Associate Professor',
        qualification: 'M.Tech in Electrical Engineering',
        experience: '12 years',
        subjects: ['Circuit Theory', 'Power Systems', 'Electrical Machines'],
        profilePicture: null,
        email: 'sunita.verma@gpcitarsi.edu.in'
      },
      {
        _id: 'fallback3',
        name: 'Dr. Amit Patel',
        department: 'Mechanical Engineering',
        designation: 'Assistant Professor',
        qualification: 'Ph.D. in Mechanical Engineering',
        experience: '8 years',
        subjects: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design'],
        profilePicture: null,
        email: 'amit.patel@gpcitarsi.edu.in'
      }
    ];

    setFaculty(fallbackFaculty);
  };

  // Get unique departments for filter
  const departments = [...new Set(faculty.map(teacher => teacher.department))];

  // Filter faculty by department
  const filteredFaculty = selectedDepartment
    ? faculty.filter(teacher => teacher.department === selectedDepartment)
    : faculty;

  // Function to get profile image URL
  const getProfileImageUrl = (profilePicture, department) => {
    // If there's a profile picture, try to use it from the server
    if (profilePicture) {
      // Check if it's already a full URL (from Cloudinary or external source)
      if (profilePicture.startsWith('http')) {
        console.log('Using full URL for profile picture:', profilePicture);
        return profilePicture;
      }

      // Check if it's a Cloudinary path
      if (profilePicture.includes('cloudinary.com')) {
        console.log('Using Cloudinary URL for profile picture:', profilePicture);
        return profilePicture;
      }

      // If it's 'default-teacher.jpg' or 'default-profile.jpg', use a placeholder
      if (profilePicture === 'default-teacher.jpg' || profilePicture === 'default-profile.jpg') {
        console.log('Using department-based placeholder for default profile');
        return getDepartmentPlaceholder(department);
      }

      // Otherwise, assume it's a local path
      const fullUrl = `${config.apiUrl}/uploads/profiles/${profilePicture}`;
      console.log('Using server URL for profile picture:', fullUrl);
      return fullUrl;
    }

    // If no profile picture, use department-based placeholder
    return getDepartmentPlaceholder(department);
  };

  // Helper function to get department-specific placeholder images
  const getDepartmentPlaceholder = (department) => {
    // Map department to full name if it's an abbreviation
    const mappedDepartment = mapDepartment(department);

    console.log('Getting placeholder for department:', mappedDepartment);

    // Use placeholder images based on department as fallback
    if (mappedDepartment === 'Computer Science') {
      return 'https://randomuser.me/api/portraits/men/41.jpg';
    } else if (mappedDepartment === 'Mechanical Engineering') {
      return 'https://randomuser.me/api/portraits/men/44.jpg';
    } else if (mappedDepartment === 'Electrical Engineering') {
      return 'https://randomuser.me/api/portraits/men/32.jpg';
    } else if (mappedDepartment === 'Electronics and Telecommunication') {
      return 'https://randomuser.me/api/portraits/women/68.jpg';
    } else if (mappedDepartment === 'Civil Engineering') {
      return 'https://randomuser.me/api/portraits/women/45.jpg';
    } else if (mappedDepartment === 'Humanities') {
      return 'https://randomuser.me/api/portraits/women/22.jpg';
    } else {
      return 'https://randomuser.me/api/portraits/men/15.jpg';
    }
  };

  // Handle image error
  const handleImageError = (e) => {
    // Get the department from the data attribute
    const department = e.target.dataset.department;
    console.log('Image error for department:', department);

    // Use our helper function to get a department-specific placeholder
    const placeholderUrl = getDepartmentPlaceholder(department);
    console.log('Using fallback image:', placeholderUrl);

    e.target.src = placeholderUrl;

    // Add a retry counter to prevent infinite loops
    const retryCount = parseInt(e.target.dataset.retryCount || '0');
    if (retryCount < 2) {
      e.target.dataset.retryCount = (retryCount + 1).toString();
    } else {
      // If we've already retried twice, use a guaranteed fallback
      e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
      console.log('Using final fallback after multiple failures');

      // Remove the error handler to prevent further retries
      e.target.onerror = null;
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
      {/* SEO Optimization */}
      <SEO
        title="Faculty - Government Polytechnic College Itarsi"
        description="Meet the experienced faculty members of Government Polytechnic College Itarsi (GPC Itarsi). Our dedicated professors and instructors provide quality technical education across various departments."
        keywords="Government Polytechnic College Itarsi faculty, GPC Itarsi professors, GPCI teachers, Polytechnic faculty Itarsi, engineering faculty, technical education instructors"
        ogImage="/images/faculty-banner.jpg"
      />

      {/* Schema.org Markup */}
      <SchemaMarkup schema={breadcrumbSchema} id="breadcrumb-schema" />

      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary-600">
          Our Faculty
        </h1>
        <p className="mt-2 sm:mt-3 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-secondary-600 px-2">
          Meet our experienced and dedicated faculty members
        </p>
      </div>

      {/* Department Filter */}
      <div className="mb-8 px-2 sm:px-0">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedDepartment('')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg shadow-sm department-filter-button ${
              selectedDepartment === ''
                ? 'bg-primary-600 text-white'
                : 'bg-white text-primary-600 hover:bg-primary-50'
            }`}
          >
            All Departments
          </button>
          {departments.map(dept => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg shadow-sm department-filter-button ${
                selectedDepartment === dept
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-primary-600 hover:bg-primary-50'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Cards */}
      {loading ? (
        <div className="flex flex-col sm:flex-row justify-center items-center py-8 sm:py-12 px-4">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary-500 mb-3 sm:mb-0"></div>
          <span className="sm:ml-3 text-primary-600 text-center sm:text-left">Loading faculty information...</span>
        </div>
      ) : error ? (
        <div>
          <div className="text-center py-6 mb-6 px-4">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg sm:text-xl font-medium text-amber-600 mb-2">
              {error.includes('timeout') ? 'Request timed out' : 'Connection issue detected'}
            </p>
            <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-md mx-auto">
              {error.includes('timeout')
                ? 'The server took too long to respond. Showing available faculty information.'
                : 'There was an issue connecting to the server. Showing available faculty information.'}
            </p>

            <button
              onClick={fetchFaculty}
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 faculty-button"
              aria-label="Refresh faculty data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>

          {/* Show faculty data anyway if we have fallback data */}
          {filteredFaculty.length > 0 && (
            <div>
              <p className="text-center text-primary-600 font-medium mb-6">
                Displaying available faculty information below
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {filteredFaculty.map(teacher => (
                  <div key={teacher._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 faculty-card">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-3 sm:mb-4 border-4 border-primary-100 shadow-sm">
                          <img
                            src={getProfileImageUrl(teacher.profilePicture, teacher.department)}
                            alt={teacher.name}
                            className="faculty-profile-image"
                            data-department={teacher.department}
                            onError={handleImageError}
                            loading="lazy"
                          />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-primary-600 mb-1 text-center faculty-text-content">{teacher.name}</h3>
                        <p className="text-secondary-600 mb-2 text-center text-sm sm:text-base faculty-text-content">{teacher.designation || `Faculty, ${teacher.department}`}</p>
                        <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                          {teacher.department}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-2">
                        {teacher.qualification && (
                          <div className="flex items-start mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                            <span className="text-secondary-700 text-sm sm:text-base break-words">{teacher.qualification || "M.Tech"}</span>
                          </div>
                        )}

                        {teacher.experience && (
                          <div className="flex items-start mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-secondary-700 text-sm sm:text-base break-words">{teacher.experience || "10+ years of experience"}</span>
                          </div>
                        )}

                        <div className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div className="text-secondary-700 min-w-0 faculty-subjects">
                            <span className="font-medium text-sm sm:text-base">Subjects:</span>
                            <ul className="list-disc list-outside ml-4 mt-1 space-y-1">
                              {teacher.subjects && teacher.subjects.length > 0 ? (
                                teacher.subjects.map((subject, index) => (
                                  <li key={index} className="text-xs sm:text-sm break-words faculty-text-content">{subject}</li>
                                ))
                              ) : (
                                <li className="text-xs sm:text-sm faculty-text-content">General Subjects</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg sm:text-xl font-medium text-secondary-600 mb-2">No faculty members found</p>
          <p className="text-sm sm:text-base text-gray-500 mb-4 max-w-md mx-auto">Faculty information will be available soon.</p>

          <button
            onClick={fetchFaculty}
            className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 faculty-button"
            aria-label="Refresh faculty data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {filteredFaculty.map(teacher => (
            <div key={teacher._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 faculty-card">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-3 sm:mb-4 border-4 border-primary-100 shadow-sm">
                    <img
                      src={getProfileImageUrl(teacher.profilePicture, teacher.department)}
                      alt={teacher.name}
                      className="faculty-profile-image"
                      data-department={teacher.department}
                      onError={handleImageError}
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-primary-600 mb-1 text-center faculty-text-content">{teacher.name}</h3>
                  <p className="text-secondary-600 mb-2 text-center text-sm sm:text-base faculty-text-content">{teacher.designation || `Faculty, ${teacher.department}`}</p>
                  <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                    {teacher.department}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-2">
                  {teacher.qualification && (
                    <div className="flex items-start mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                      <span className="text-secondary-700 text-sm sm:text-base break-words">{teacher.qualification || "M.Tech"}</span>
                    </div>
                  )}

                  {teacher.experience && (
                    <div className="flex items-start mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-secondary-700 text-sm sm:text-base break-words">{teacher.experience || "10+ years of experience"}</span>
                    </div>
                  )}

                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-secondary-700 min-w-0 faculty-subjects">
                      <span className="font-medium text-sm sm:text-base">Subjects:</span>
                      <ul className="list-disc list-outside ml-4 mt-1 space-y-1">
                        {teacher.subjects && teacher.subjects.length > 0 ? (
                          teacher.subjects.map((subject, index) => (
                            <li key={index} className="text-xs sm:text-sm break-words faculty-text-content">{subject}</li>
                          ))
                        ) : (
                          <li className="text-xs sm:text-sm faculty-text-content">General Subjects</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Faculty;
