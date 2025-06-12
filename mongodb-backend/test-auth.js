/**
 * Test script for authentication
 * 
 * This script tests the login functionality to ensure that password verification
 * is working correctly. It attempts to log in with:
 * 1. Valid username and valid password (should succeed)
 * 2. Valid username and invalid password (should fail)
 * 
 * Run this script with: node test-auth.js
 */

const axios = require('axios');
const config = require('./config');

// Test user credentials
const validUsername = 'admin';
const validPassword = 'admin123';
const invalidPassword = 'wrongpassword';

// API URL
const apiUrl = 'http://localhost:5000/api/auth/login';

// Test valid login
async function testValidLogin() {
  try {
    console.log('\n--- Testing Valid Login ---');
    console.log(`Username: ${validUsername}`);
    console.log(`Password: ${validPassword}`);
    
    const response = await axios.post(apiUrl, {
      username: validUsername,
      password: validPassword
    });
    
    console.log('Login successful!');
    console.log('Response status:', response.status);
    console.log('User role:', response.data.user.role);
    console.log('Token received:', response.data.token ? 'Yes' : 'No');
    
    return true;
  } catch (error) {
    console.error('Valid login test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    return false;
  }
}

// Test invalid login
async function testInvalidLogin() {
  try {
    console.log('\n--- Testing Invalid Login ---');
    console.log(`Username: ${validUsername}`);
    console.log(`Password: ${invalidPassword}`);
    
    const response = await axios.post(apiUrl, {
      username: validUsername,
      password: invalidPassword
    });
    
    console.error('ERROR: Login succeeded with invalid password!');
    console.error('Response status:', response.status);
    console.error('User role:', response.data.user.role);
    
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('Test passed: Invalid login correctly rejected with 401 status');
      console.log('Response data:', error.response.data);
      return true;
    } else {
      console.error('Invalid login test failed with unexpected error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return false;
    }
  }
}

// Run the tests
async function runTests() {
  console.log('=== Authentication Test Script ===');
  
  // Start the server before running tests
  console.log('Make sure the server is running on http://localhost:5000');
  
  // Run tests
  const validLoginResult = await testValidLogin();
  const invalidLoginResult = await testInvalidLogin();
  
  // Print summary
  console.log('\n=== Test Results ===');
  console.log('Valid login test:', validLoginResult ? 'PASSED' : 'FAILED');
  console.log('Invalid login test:', invalidLoginResult ? 'PASSED' : 'FAILED');
  
  if (validLoginResult && invalidLoginResult) {
    console.log('\n✅ All tests passed! Authentication is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Authentication may not be working correctly.');
  }
}

// Run the tests
runTests();
