import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/gallery`);
        setImages(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching gallery:', error);
        setError('Failed to load gallery images');
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Campus Life</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            Image Gallery
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Explore our campus life and activities through our image gallery.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading gallery...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">{error}</div>
        ) : images.length === 0 ? (
          <div className="py-20 text-center text-gray-500">No images available</div>
        ) : (
          <div className="mt-12 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div
                key={image._id}
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-transform transform hover:scale-105"
                onClick={() => openLightbox(image)}
              >
                <div className="h-64 w-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={image.image && image.image.startsWith('http') ? image.image : `${config.apiUrl}/uploads/gallery/${image.image}`}
                    alt={image.title}
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src);
                      e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
                    }}
                  />
                </div>
                <div className="px-4 py-4">
                  <h3 className="text-lg font-medium text-gray-900">{image.title}</h3>
                  {image.description && (
                    <p className="mt-1 text-sm text-gray-500">{image.description}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Uploaded on {formatDate(image.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75" onClick={closeLightbox}>
            <div className="max-w-4xl w-full bg-white rounded-lg overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <img
                  className="w-full max-h-[80vh] object-contain"
                  src={selectedImage.image && selectedImage.image.startsWith('http') ? selectedImage.image : `${config.apiUrl}/uploads/gallery/${selectedImage.image}`}
                  alt={selectedImage.title}
                  onError={(e) => {
                    console.error('Lightbox image failed to load:', e.target.src);
                    e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
                  }}
                />
                <button
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2"
                  onClick={closeLightbox}
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-medium text-gray-900">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="mt-2 text-gray-500">{selectedImage.description}</p>
                )}
                <p className="mt-2 text-sm text-gray-400">
                  Uploaded on {formatDate(selectedImage.createdAt)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
