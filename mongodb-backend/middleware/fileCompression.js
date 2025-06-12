const fs = require('fs');
const path = require('path');
const util = require('util');
const { pipeline } = require('stream');
const zlib = require('zlib');
const os = require('os');

// Convert pipeline to promise-based function
const pipelineAsync = util.promisify(pipeline);

/**
 * Middleware to compress files before uploading to Cloudinary
 * This middleware will compress PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX files
 * Images are handled separately by Cloudinary's own optimization
 */
const compressFile = async (req, res, next) => {
  try {
    // If no file is uploaded, skip compression
    if (!req.file) {
      console.log('No file to compress, skipping compression middleware');
      return next();
    }

    const file = req.file;
    console.log(`Processing file for compression: ${file.originalname}`);

    // Get file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Skip compression for image files (Cloudinary handles image optimization)
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
      console.log('Skipping compression for image file, Cloudinary will optimize it');
      return next();
    }

    // Get mimetype from file
    console.log('File mimetype:', file.mimetype);

    // For document files, apply compression
    if (['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt'].includes(fileExtension)) {
      console.log(`Compressing document file: ${file.originalname}`);

      try {
        // Create temp file paths
        const tempInputPath = file.path;
        const tempOutputPath = path.join(os.tmpdir(), `compressed-${Date.now()}-${path.basename(file.originalname)}`);

        // Create read and write streams
        const readStream = fs.createReadStream(tempInputPath);
        const writeStream = fs.createWriteStream(tempOutputPath);

        // Create gzip compression stream
        const gzip = zlib.createGzip({
          level: 6 // Moderate compression level for better compatibility
        });

        // Pipe the streams: read -> compress -> write
        await pipelineAsync(
          readStream,
          gzip,
          writeStream
        );

        // Get file stats before and after compression
        const originalStats = fs.statSync(tempInputPath);
        const compressedStats = fs.statSync(tempOutputPath);

        // Calculate compression ratio
        const compressionRatio = (1 - (compressedStats.size / originalStats.size)) * 100;

        // Only use the compressed file if it's actually smaller
        if (compressionRatio > 5) { // Only use if we get at least 5% reduction
          console.log(`File compressed: ${originalStats.size} bytes -> ${compressedStats.size} bytes (${compressionRatio.toFixed(2)}% reduction)`);

          // Replace the original file with the compressed one
          fs.unlinkSync(tempInputPath);
          fs.copyFileSync(tempOutputPath, tempInputPath);

          // Update file size in the request object
          file.size = compressedStats.size;

          console.log('File compression completed successfully');
        } else {
          console.log(`Compression not effective (only ${compressionRatio.toFixed(2)}% reduction), using original file`);
        }

        // Clean up temp file
        fs.unlinkSync(tempOutputPath);
      } catch (compressionError) {
        console.error('Error during file compression, using original file:', compressionError);
        // Continue with the original file
      }
    } else {
      console.log(`Skipping compression for file type: ${fileExtension}`);

      // Accept all files at this stage - validation should have already happened in cloudinaryUpload
      // This prevents double validation errors
    }

    next();
  } catch (error) {
    console.error('Error in file compression middleware:', error);
    // Continue without compression if there's an error
    next(error);
  }
};

module.exports = compressFile;
