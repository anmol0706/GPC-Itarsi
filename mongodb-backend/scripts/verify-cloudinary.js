/**
 * Cloudinary Verification Script
 * 
 * This script helps verify your Cloudinary credentials and tests the connection.
 * Run this script with: node scripts/verify-cloudinary.js
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Print current Cloudinary configuration from .env
console.log('Current Cloudinary configuration:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || 'Not set');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '[HIDDEN]' : 'Not set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '[HIDDEN]' : 'Not set');

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Test Cloudinary connection
async function testCloudinaryConnection() {
  try {
    console.log('\nTesting Cloudinary connection...');
    
    // Ping Cloudinary to check connection
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('Response:', result);
    
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:');
    if (error.error) {
      console.error('Error code:', error.error.http_code);
      console.error('Error message:', error.error.message);
    } else {
      console.error('Error:', error);
    }
    
    return false;
  }
}

// Test Cloudinary upload
async function testCloudinaryUpload() {
  try {
    console.log('\nTesting Cloudinary upload...');
    
    // Create a test image if it doesn't exist
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (!fs.existsSync(testImagePath)) {
      // Create a simple 1x1 pixel PNG
      const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
      fs.writeFileSync(testImagePath, buffer);
      console.log('Created test image at:', testImagePath);
    }
    
    // Upload the test image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(testImagePath, {
      folder: 'test',
      public_id: 'test-image-' + Date.now()
    });
    
    console.log('✅ Cloudinary upload successful!');
    console.log('Uploaded image URL:', uploadResult.secure_url);
    
    return true;
  } catch (error) {
    console.error('❌ Cloudinary upload failed:');
    if (error.error) {
      console.error('Error code:', error.error.http_code);
      console.error('Error message:', error.error.message);
    } else {
      console.error('Error:', error);
    }
    
    return false;
  }
}

// Run the tests
async function runTests() {
  const connectionSuccess = await testCloudinaryConnection();
  
  if (connectionSuccess) {
    await testCloudinaryUpload();
  }
  
  console.log('\n=== Cloudinary Verification Summary ===');
  if (connectionSuccess) {
    console.log('✅ Your Cloudinary credentials are valid and working correctly.');
    console.log('You can use Cloudinary for image uploads in your application.');
  } else {
    console.log('❌ Your Cloudinary credentials are not working.');
    console.log('Please check the following:');
    console.log('1. Verify that your CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are correct');
    console.log('2. Make sure your Cloudinary account is active');
    console.log('3. Check if your network allows outbound connections to Cloudinary');
    console.log('\nTo fix this issue:');
    console.log('1. Log in to your Cloudinary dashboard at https://cloudinary.com/console');
    console.log('2. Copy your Cloud Name, API Key, and API Secret');
    console.log('3. Update these values in your .env file');
    console.log('4. Run this script again to verify the connection');
  }
}

// Create scripts directory if it doesn't exist
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Run all tests
runTests().catch(err => {
  console.error('Unexpected error during tests:', err);
});
