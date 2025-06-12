# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image uploads in your application.

## Current Status

The Cloudinary integration is currently not working due to credential issues. When testing the connection, we get a "cloud_name mismatch" error, which indicates that the cloud name doesn't match the API key and secret.

## How to Fix

1. **Log in to your Cloudinary Dashboard**
   - Go to https://cloudinary.com/console
   - Sign in with your credentials

2. **Get your Cloudinary Credentials**
   - On the dashboard, look for the "Account Details" section
   - Note your Cloud Name, API Key, and API Secret
   - Make sure you're looking at the correct environment (if you have multiple environments)

3. **Update your .env File**
   - Open the `.env` file in the `mongodb-backend` directory
   - Update the following variables with your Cloudinary credentials:
     ```
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
     ```

4. **Verify the Connection**
   - Run the verification script to check if your credentials are working:
     ```
     node scripts/verify-cloudinary.js
     ```
   - If successful, you should see a message indicating that the connection is working

5. **Test the Upload**
   - In the admin profile page, toggle the switch to use Cloudinary
   - Upload a profile picture to test if it works

## Troubleshooting

If you're still having issues with Cloudinary, try the following:

1. **Check for Typos**
   - Make sure there are no typos in your credentials
   - The cloud name, API key, and API secret are case-sensitive

2. **Check Account Status**
   - Make sure your Cloudinary account is active and not suspended
   - Check if you've reached your usage limits

3. **Network Issues**
   - Make sure your server can connect to Cloudinary's API
   - Check if there are any firewall rules blocking the connection

4. **API Restrictions**
   - Check if you have any API restrictions set up in your Cloudinary account
   - Make sure the IP address of your server is allowed

5. **Try the Combination Test**
   - Run the combination test script to try different combinations of credentials:
     ```
     node test-cloudinary-combinations.js
     ```

## Fallback Solution

Until the Cloudinary integration is fixed, the application will use local storage for file uploads. This means that profile pictures will be stored on your server rather than in Cloudinary.

To use local storage:
1. In the admin profile page, make sure the "Using Local Storage" option is selected
2. Upload your profile picture as usual
3. The image will be stored in the `uploads/profiles` directory on your server

Note: Local storage is not ideal for production as it uses more server storage and doesn't provide the same benefits as Cloudinary (like automatic image optimization and CDN delivery).
