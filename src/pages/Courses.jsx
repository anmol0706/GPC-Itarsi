import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/courses`);
        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = async (courseId) => {
    try {
      const response = await axios.get(`${API_URL}/api/courses/${courseId}`);
      setSelectedCourse(response.data);
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const closeModal = () => {
    setSelectedCourse(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Academics</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            Our Courses
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Explore our wide range of courses designed to provide quality education and prepare students for successful careers.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">{error}</div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center text-gray-500">No courses available</div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-transform transform hover:scale-105"
                onClick={() => handleCourseClick(course._id)}
              >
                <div className="h-48 w-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={course.image ? `${API_URL}/uploads/${course.image}` : 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}
                    alt={course.title}
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src);
                      e.target.src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
                    }}
                  />
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{course.title}</h3>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {course.code}
                    </span>
                    <span className="ml-2">{course.duration}</span>
                  </div>
                  <p className="mt-3 text-base text-gray-500 line-clamp-3">
                    {course.description}
                  </p>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      View details &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Course Details Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedCourse.title}</h3>
                      <div className="mt-2">
                        {selectedCourse.image && (
                          <div className="mb-4 rounded-lg overflow-hidden">
                            <img
                              className="w-full h-48 object-cover"
                              src={`${API_URL}/uploads/${selectedCourse.image}`}
                              alt={selectedCourse.title}
                              onError={(e) => {
                                console.error('Image failed to load:', e.target.src);
                                e.target.src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex items-center mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            {selectedCourse.code}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">{selectedCourse.duration}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{selectedCourse.description}</p>

                        <h4 className="text-md font-medium text-gray-900 mb-2">Faculty:</h4>
                        {selectedCourse.teachers && selectedCourse.teachers.length > 0 ? (
                          <ul className="list-disc pl-5 text-sm text-gray-500">
                            {selectedCourse.teachers.map((teacher) => (
                              <li key={teacher._id}>{teacher.name} - {teacher.department}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No faculty assigned yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
