import { useState, useEffect, useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import { getProfileImageUrl, handleImageError } from '../../utils/imageUtils';
import LoadingSpinner from '../../components/LoadingSpinner';

// Define the drag item type
const ItemTypes = {
  FACULTY: 'faculty'
};

// Draggable faculty card component
const FacultyCard = ({ faculty, index, moveCard }) => {
  const ref = useRef(null);

  // Set up drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FACULTY,
    item: { id: faculty._id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up drop functionality
  const [, drop] = useDrop({
    accept: ItemTypes.FACULTY,
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  // Connect drag and drop refs
  drag(drop(ref));

  // Apply styles for dragging
  const opacity = isDragging ? 0.4 : 1;

  return (
    <div
      ref={ref}
      className={`p-4 mb-2 bg-white rounded-lg shadow-md cursor-move transition-all duration-200 ${
        isDragging ? 'border-2 border-primary-500 shadow-lg' : ''
      }`}
      style={{ opacity }}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-100">
            <img
              src={getProfileImageUrl(faculty.profilePicture, faculty.department)}
              alt={faculty.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-primary-700">{faculty.name}</h3>
          <p className="text-sm text-gray-600">{faculty.department}</p>
        </div>
        <div className="flex-shrink-0 flex items-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            Position: {index + 1}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Main component
const FacultyOrder = () => {
  const { token } = useAuth();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch faculty data
  const fetchFaculty = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${config.apiUrl}/api/faculty`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Sort by displayOrder if available, otherwise by name
      const sortedFaculty = response.data.sort((a, b) => {
        if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
          return a.displayOrder - b.displayOrder;
        }
        return a.name.localeCompare(b.name);
      });

      setFaculty(sortedFaculty);
      setHasChanges(false);
    } catch (err) {
      console.error('Error fetching faculty:', err);
      setError('Failed to load faculty members. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  // Move card handler for drag and drop
  const moveCard = useCallback((dragIndex, hoverIndex) => {
    setFaculty((prevFaculty) => {
      const newFaculty = [...prevFaculty];
      // Remove the dragged item
      const draggedItem = newFaculty[dragIndex];
      // Remove from old position and insert at new position
      newFaculty.splice(dragIndex, 1);
      newFaculty.splice(hoverIndex, 0, draggedItem);
      setHasChanges(true);
      return newFaculty;
    });
  }, []);

  // Save the new order
  const saveOrder = async () => {
    try {
      setSaving(true);
      setError(null);

      // Prepare the data to send
      const facultyOrder = faculty.map((item, index) => ({
        _id: item._id,
        displayOrder: index
      }));

      // Send the update request
      await axios.put(
        `${config.apiUrl}/api/faculty/update-order`,
        { facultyOrder },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      showSuccessToast('Faculty order updated successfully');
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving faculty order:', err);
      setError('Failed to save faculty order. Please try again.');
      showErrorToast('Failed to save faculty order');
    } finally {
      setSaving(false);
    }
  };

  // Get unique departments for filtering
  const departments = ['all', ...new Set(faculty.map(f => f.department))];

  // Filter faculty by department
  const filteredFaculty = filterDepartment === 'all'
    ? faculty
    : faculty.filter(f => f.department === filterDepartment);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary-800">Faculty Order Management</h1>
        <button
          onClick={saveOrder}
          disabled={saving || !hasChanges}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            hasChanges ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
        >
          {saving ? 'Saving...' : 'Save Order'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Department
        </label>
        <select
          id="department-filter"
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept === 'all' ? 'All Departments' : dept}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading faculty members..." />
      ) : (
        <DndProvider backend={HTML5Backend}>
          <div className="space-y-2">
            {filteredFaculty.map((faculty, index) => (
              <FacultyCard
                key={faculty._id}
                index={index}
                faculty={faculty}
                moveCard={moveCard}
              />
            ))}
          </div>
        </DndProvider>
      )}

      {hasChanges && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchFaculty}
            className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            onClick={saveOrder}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {saving ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FacultyOrder;
