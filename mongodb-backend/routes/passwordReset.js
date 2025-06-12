const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../config/email');
const { authenticateToken } = require('../middleware/auth');

// Request password reset with OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log(`Password reset requested for email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });

    // If user not found, still return success to prevent email enumeration attacks
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return res.status(200).json({
        message: 'If a user with that email exists, a password reset OTP has been sent'
      });
    }

    // Generate OTP for password reset
    const otp = user.generatePasswordResetOTP();
    await user.save();

    // Create email content with OTP
    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your GPC Itarsi account.</p>
      <p>Your One-Time Password (OTP) for password reset is:</p>
      <div style="margin: 20px 0; padding: 10px; background-color: #f0f0f0; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
        ${otp}
      </div>
      <p>Please enter this OTP on the password reset page to verify your identity.</p>
      <p>This OTP is valid for 10 minutes only.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Password Reset OTP - GPC Itarsi',
      html: message
    });

    console.log(`Password reset OTP email sent to: ${email}`);

    res.status(200).json({
      message: 'If a user with that email exists, a password reset OTP has been sent',
      email: email // Return the email for the next step
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Error processing your request', error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    console.log(`Verifying OTP for email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    // Hash the provided OTP
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // Check if OTP matches and is still valid
    if (user.resetOTP !== hashedOTP || !user.resetOTPExpires || user.resetOTPExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid - generate a temporary token for the reset form
    const tempToken = crypto.randomBytes(20).toString('hex');

    // Store the temp token
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(tempToken)
      .digest('hex');

    // Set token expiry time (10 minutes from now)
    user.resetPasswordExpires = Date.now() + 600000; // 10 minutes

    // Keep the OTP valid for a short time to allow for the password reset
    // We'll extend the OTP expiry time by 5 minutes
    user.resetOTPExpires = Date.now() + 300000; // 5 minutes

    await user.save();

    console.log(`OTP verified successfully for email: ${email}`);

    // Return success with the temp token
    res.status(200).json({
      message: 'OTP verified successfully',
      token: tempToken,
      email: email
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
});

// Validate reset token
router.get('/validate-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    console.log(`Validating reset token: ${token.substring(0, 10)}...`);

    if (!token) {
      console.log('Token validation failed: No token provided');
      return res.status(400).json({ message: 'Token is required' });
    }

    // Hash the token from the URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    console.log(`Looking for user with hashed token: ${hashedToken.substring(0, 10)}...`);

    // Find user with this token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Token validation failed: No user found with valid token');
      return res.status(400).json({
        message: 'Password reset token is invalid or has expired'
      });
    }

    console.log(`Token validation successful for user: ${user.username}`);

    // Token is valid
    res.status(200).json({
      message: 'Token is valid',
      userId: user._id
    });
  } catch (error) {
    console.error('Error validating reset token:', error);
    res.status(500).json({ message: 'Error validating token', error: error.message });
  }
});

// Reset password with token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log(`Processing password reset for token: ${token.substring(0, 10)}...`);
    console.log(`Request headers:`, req.headers);

    if (!token || !password) {
      console.log('Missing required fields for password reset');
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Hash the token from the URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    console.log(`Looking for user with hashed token: ${hashedToken.substring(0, 10)}...`);

    // Find user with this token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('No user found with valid reset token');
      console.log('Token validation failed. Checking database for any matching tokens...');

      // For debugging: Find any users with reset tokens
      const usersWithTokens = await User.find({
        resetPasswordToken: { $exists: true, $ne: null },
        resetPasswordExpires: { $exists: true }
      }).select('username resetPasswordToken resetPasswordExpires');

      console.log(`Found ${usersWithTokens.length} users with reset tokens:`);
      usersWithTokens.forEach(u => {
        console.log(`- User: ${u.username}, Token expires: ${new Date(u.resetPasswordExpires).toISOString()}, Valid: ${u.resetPasswordExpires > Date.now()}`);
      });

      return res.status(400).json({
        message: 'Password reset token is invalid or has expired'
      });
    }

    console.log(`Found user: ${user.username} with valid reset token`);

    // Update password
    user.password = password;

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log(`Password reset successful for user: ${user.username}`);

    // Send confirmation email
    const message = `
      <h1>Password Reset Successful</h1>
      <p>Your password has been successfully reset.</p>
      <p>If you did not perform this action, please contact the administrator immediately.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Successful - GPC Itarsi',
      html: message
    });

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

// Reset password with email and OTP directly
router.post('/reset-password-with-otp', async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    console.log('Reset password request received:', { email, otp: otp ? '******' : undefined, password: password ? '******' : undefined });
    console.log('Request headers:', req.headers);

    if (!email || !otp || !password) {
      console.log('Missing required fields:', {
        hasEmail: !!email,
        hasOTP: !!otp,
        hasPassword: !!password
      });
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    console.log(`Resetting password with OTP for email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`No user found with email: ${email}`);
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    console.log(`Found user: ${user.username} (${user._id})`);

    // Check if we have a reset token from the verify-otp step
    const token = req.headers.authorization?.split(' ')[1];
    let isTokenValid = false;

    if (token) {
      console.log(`Validating token: ${token.substring(0, 10)}...`);

      // Try to validate with token first
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      isTokenValid = user.resetPasswordToken === hashedToken &&
                    user.resetPasswordExpires &&
                    user.resetPasswordExpires > Date.now();

      console.log('Token validation result:', isTokenValid);

      if (!isTokenValid && user.resetPasswordToken) {
        console.log('Token mismatch:');
        console.log(`- Provided token hash: ${hashedToken.substring(0, 10)}...`);
        console.log(`- Stored token hash: ${user.resetPasswordToken.substring(0, 10)}...`);
        console.log(`- Token expiry: ${user.resetPasswordExpires ? new Date(user.resetPasswordExpires).toISOString() : 'none'}`);
        console.log(`- Token expired: ${user.resetPasswordExpires ? user.resetPasswordExpires < Date.now() : 'N/A'}`);
      }
    } else {
      console.log('No authorization token provided in headers');
    }

    // If token is not valid, try OTP validation
    if (!isTokenValid) {
      console.log('Token validation failed, trying OTP validation');

      // Hash the provided OTP
      const hashedOTP = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

      console.log(`Validating OTP for user: ${user.username}`);
      console.log(`- Provided OTP hash: ${hashedOTP.substring(0, 10)}...`);
      console.log(`- Stored OTP hash: ${user.resetOTP ? user.resetOTP.substring(0, 10) + '...' : 'none'}`);
      console.log(`- OTP expiry: ${user.resetOTPExpires ? new Date(user.resetOTPExpires).toISOString() : 'none'}`);
      console.log(`- OTP expired: ${user.resetOTPExpires ? user.resetOTPExpires < Date.now() : 'N/A'}`);

      // Check if OTP matches and is still valid
      if (user.resetOTP !== hashedOTP || !user.resetOTPExpires || user.resetOTPExpires < Date.now()) {
        console.log('Invalid or expired OTP');
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      console.log('OTP validation successful');
    }

    // Update password
    user.password = password;

    // Clear reset fields
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log(`Password reset successful for user: ${user.username}`);

    // Send confirmation email
    try {
      const message = `
        <h1>Password Reset Successful</h1>
        <p>Your password has been successfully reset.</p>
        <p>If you did not perform this action, please contact the administrator immediately.</p>
      `;

      await sendEmail({
        to: user.email,
        subject: 'Password Reset Successful - GPC Itarsi',
        html: message
      });

      console.log(`Confirmation email sent to: ${user.email}`);
    } catch (emailError) {
      // Don't fail the password reset if email sending fails
      console.error('Error sending confirmation email:', emailError);
    }

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password with OTP:', error);

    // More detailed error logging
    if (error.name === 'MongoServerError') {
      console.error('MongoDB error code:', error.code);
    } else if (error.name === 'ValidationError') {
      console.error('Validation error details:', error.errors);
    }

    res.status(500).json({
      message: 'Error resetting password',
      error: error.message,
      errorType: error.name
    });
  }
});

module.exports = router;
