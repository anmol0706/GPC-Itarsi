import { useState, useEffect } from 'react';
import axios from 'axios';

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

  useEffect(() => {
    fetchFaculty();
  }, []);

  // Fetch faculty data from API with fallback to empty array
  const fetchFaculty = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch real faculty data from the API
      const response = await axios.get('http://localhost:5001/api/faculty');

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
        // If no data is returned, set empty array
        setFaculty([]);
        console.log('No faculty data found');
      }
    } catch (error) {
      console.error('Error fetching faculty data:', error);
      // Set empty array if API call fails
      setFaculty([]);
    } finally {
      setLoading(false);
    }
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
      return `http://localhost:5001/uploads/profiles/${profilePicture}`;
    }

    // Map department to full name if it's an abbreviation
    const mappedDepartment = mapDepartment(department);

    // Use placeholder images based on department as fallback
    if (mappedDepartment === 'Computer Science') {
      return 'https://randomuser.me/api/portraits/men/41.jpg';
    } else if (mappedDepartment === 'Mechanical Engineering') {
      return 'https://randomuser.me/api/portraits/women/44.jpg';
    } else if (mappedDepartment === 'Electrical Engineering') {
      return 'https://randomuser.me/api/portraits/men/32.jpg';
    } else if (mappedDepartment === 'Electronics and Telecommunication') {
      return 'https://randomuser.me/api/portraits/women/68.jpg';
    } else {
      return 'https://randomuser.me/api/portraits/men/15.jpg';
    }
  };

  // Handle image error
  const handleImageError = (e) => {
    // Get the department from the data attribute
    const department = e.target.dataset.department;

    // Map department to full name if it's an abbreviation
    const mappedDepartment = mapDepartment(department);

    // Use department-specific fallback images
    if (mappedDepartment === 'Computer Science') {
      e.target.src = 'https://randomuser.me/api/portraits/men/41.jpg';
    } else if (mappedDepartment === 'Mechanical Engineering') {
      e.target.src = 'https://randomuser.me/api/portraits/women/44.jpg';
    } else if (mappedDepartment === 'Electrical Engineering') {
      e.target.src = 'https://randomuser.me/api/portraits/men/32.jpg';
    } else if (mappedDepartment === 'Electronics and Telecommunication') {
      e.target.src = 'https://randomuser.me/api/portraits/women/68.jpg';
    } else {
      e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-primary-600 sm:text-4xl">
          Our Faculty
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-secondary-600">
          Meet our experienced and dedicated faculty members
        </p>
      </div>

      {/* Department Filter */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setSelectedDepartment('')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
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
              className={`px-4 py-2 text-sm font-medium ${
                selectedDepartment === dept
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-primary-600 hover:bg-primary-50'
              } ${
                dept === departments[departments.length - 1] ? 'rounded-r-lg' : ''
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl font-medium text-red-600 mb-2">Failed to load faculty information.</p>
          <p className="text-gray-500">Please try again later.</p>
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl font-medium text-secondary-600 mb-2">No faculty members found</p>
          <p className="text-gray-500">Faculty information will be available soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFaculty.map(teacher => (
            <div key={teacher._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-primary-100">
                    <img
                      src={getProfileImageUrl(teacher.profilePicture, teacher.department)}
                      alt={teacher.name}
                      className="w-full h-full object-cover"
                      data-department={teacher.department}
                      onError={handleImageError}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-primary-600 mb-1">{teacher.name}</h3>
                  <p className="text-secondary-600 mb-2">{teacher.designation || `Faculty, ${teacher.department}`}</p>
                  <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {teacher.department}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-2">
                  {teacher.qualification && (
                    <div className="flex items-start mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                      <span className="text-secondary-700">{teacher.qualification || "M.Tech"}</span>
                    </div>
                  )}

                  {teacher.experience && (
                    <div className="flex items-start mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-secondary-700">{teacher.experience || "10+ years of experience"}</span>
                    </div>
                  )}

                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-secondary-700">
                      <span className="font-medium">Subjects:</span>
                      <ul className="list-disc list-inside ml-1 mt-1">
                        {teacher.subjects && teacher.subjects.length > 0 ? (
                          teacher.subjects.map((subject, index) => (
                            <li key={index} className="text-sm">{subject}</li>
                          ))
                        ) : (
                          <li className="text-sm">General Subjects</li>
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
