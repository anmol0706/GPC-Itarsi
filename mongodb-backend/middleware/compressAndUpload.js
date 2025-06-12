const { cloudinaryUpload } = require('./cloudinaryUpload');
const compressFile = require('./fileCompression');

/**
 * Middleware that combines file compression and Cloudinary upload
 * First uploads the file using multer, then compresses it before proceeding
 * @param {string} field - The form field name for the file
 * @returns {Function} - Express middleware
 */
const compressAndUpload = (field) => {
  return (req, res, next) => {
    console.log(`Starting compressAndUpload middleware for field: ${field}`);
    console.log('Request URL:', req.originalUrl);

    // Log the file information if it exists in the request
    if (req.file) {
      console.log('File already exists in request:', req.file.originalname);
    } else if (req.files) {
      console.log('Files already exist in request:', Object.keys(req.files).length);
    } else {
      console.log('No files in request yet');
    }

    // First upload the file using multer
    const upload = cloudinaryUpload.single(field);

    upload(req, res, async (err) => {
      if (err) {
        console.error('Error in initial upload:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));

        // Log Cloudinary configuration for debugging
        console.log('Cloudinary configuration during error:');
        console.log('- Cloud name:', process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME : 'Not set');
        console.log('- API key configured:', process.env.CLOUDINARY_API_KEY ? 'Yes (hidden)' : 'No');
        console.log('- API secret configured:', process.env.CLOUDINARY_API_SECRET ? 'Yes (hidden)' : 'No');
        console.log('- CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? 'Set (hidden)' : 'Not set');

        // Handle file size limit error
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            message: 'File too large. Maximum size is 50MB.',
            error: 'LIMIT_FILE_SIZE',
            details: 'Please upload a smaller file (maximum 50MB)'
          });
        }

        // Handle Cloudinary specific errors
        if (err.http_code) {
          console.error('Cloudinary API error:', err);
          return res.status(400).json({
            message: 'Cloudinary upload failed',
            error: err.message || 'Cloudinary error',
            details: 'There was a problem with the cloud storage service. Please try again later.'
          });
        }

        // Special handling for study materials route - be more permissive
        if (req.originalUrl.includes('/study-material') || req.originalUrl.includes('/upload-study-material')) {
          console.log('Study materials route detected - using more permissive error handling');

          // For study materials, check if the error is related to file type
          if (err.message && err.message.includes('file type')) {
            console.log('File type error for study materials - attempting to continue');

            // Try to extract the file from the request
            if (req.file) {
              console.log('File exists despite error, continuing with:', req.file.originalname);
              return next();
            }
          }
        }

        // Handle other multer errors with proper JSON response
        console.error('File upload error details:', {
          message: err.message,
          code: err.code,
          field: field,
          originalname: req.file ? req.file.originalname : 'No file',
          mimetype: req.file ? req.file.mimetype : 'No mimetype'
        });

        return res.status(400).json({
          message: 'File upload error',
          error: err.message || 'Unknown upload error',
          code: err.code || 'UNKNOWN_ERROR',
          details: 'Please ensure you are uploading a supported file format: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF, CSV, JPG, PNG, GIF, ZIP, RAR'
        });
      }

      // If no file was uploaded, skip compression
      if (!req.file) {
        console.log('No file uploaded, skipping compression');
        return next();
      }

      try {
        console.log(`File uploaded successfully, proceeding to compression: ${req.file.originalname}`);

        // Then compress the file
        compressFile(req, res, (compressErr) => {
          if (compressErr) {
            console.error('Error in compression middleware:', compressErr);

            // For study materials, continue even if compression fails
            if (req.originalUrl.includes('/study-material') || req.originalUrl.includes('/upload-study-material')) {
              console.log('Study materials route - continuing despite compression error');
              return next();
            }

            // Return a proper error response for other routes
            return res.status(500).json({
              message: 'File compression error',
              error: compressErr.message || 'Unknown compression error'
            });
          }

          console.log('File compression completed, proceeding to next middleware');
          next();
        });
      } catch (error) {
        console.error('Error in compression middleware:', error);

        // For study materials, continue even if compression fails
        if (req.originalUrl.includes('/study-material') || req.originalUrl.includes('/upload-study-material')) {
          console.log('Study materials route - continuing despite compression error');
          return next();
        }

        // Return a proper error response for other routes
        return res.status(500).json({
          message: 'File processing error',
          error: error.message || 'Unknown error during file processing'
        });
      }
    });
  };
};

module.exports = compressAndUpload;
