import crypto from 'node:crypto';
import Email from '../../utils/email.js';
import { AppError } from '../../utils/error-handling/AppError.js';
import catchAsync from '../../utils/error-handling/catchAsync.js';
import errorDefinitions from '../../utils/error-handling/errorDefinitions.js';
import User from '../user/user.model.js';
import { setJwtCookie, signToken } from './token.js';

export const signup = catchAsync(async (req, res, next) => {
  // validate data using joi before here
  // Create new User
  const { firstName, lastName, age, photoUrl, email, password } = req.body;
  const newUser = await User.create({
    firstName,
    lastName,
    age,
    photoUrl,
    email,
    password,
  });

  // Send Welcome email
  await Email.sendWelcome({
    recipientName: newUser.firstName,
    recipientEmail: newUser.email,
  });

  // Create & Send JWT Token
  const token = await signToken(newUser._id);
  setJwtCookie(res, token);
  res.status(201).json({
    status: 'success',
    user: newUser,
  });
});

// LOGIN
/**
 * POST
 * 1. extract email & password
 * 2. check email exist
 * 3. check correct password
 * 4. IF
 *    - correct: create & send jwt token - send email
 *    - wrong: 401 error
 */
export const login = catchAsync(async (req, res, next) => {
  // EXTRACT EMAIL & PASSWORD
  const { email, password } = req.body;

  // CHECK USER EXIST & PASSWORD IS CORRECT
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.isCorrectPassword(password))) {
    return next(new AppError(errorDefinitions.AUTH.INVALID_CREDENTIALS));
  }

  // GENERATE & SEND TOKEN
  const token = await signToken(user._id);
  setJwtCookie(res, token);
  res.status(200).json({
    status: 'success',
    user,
  });
});

// LOGOUT
export const logout = (req, res, next) => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};
// FORGOT-PASSWORD
export const forgotPassword = catchAsync(async (req, res, next) => {
  // Get User Based On POSTed Email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(200).json({
      status: 'success',
      message: 'If email exists, reset link sent',
    });
  }

  // Create Password Reset Token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateModifiedOnly: true });

  // create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

  // Send reset url To registered email
  const response = await Email.sendPasswordReset({
    recipientEmail: user.email,
    recipientName: user.firstName,
    resetUrl,
  });

  if (!response.success) {
    //  - If fails reset passwordResetToken & passwordResetExpires
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Inform user
    return next(new Error('failed to send email'));
  }
  res.status(200).json({
    status: 'success',
    message: 'If email exists, reset link sent',
  });
});
// RESET-PASSWORD
export const resetPassword = catchAsync(async (req, res, next) => {
  //----- In validator validate req.params for resetToken &  req.body for pass & passConfirm
  // 1. Extract resetToken from url
  const resetToken = req.params.resetToken;
  // 2. Hash the Token
  const hashToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Find User based on passwordResetToken & passwordResetExpires
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError(errorDefinitions.VALIDATION.RESET_TOKEN_INVALID));
  }
  // 4. Reset Password & Update passwordChangedAt
  user.password = req.body.password;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save({ validateModifiedOnly: true });

  // 5. Log the user in
  const token = await signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    user,
  });
});

// UPDATE-PASSWORD
export const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get User from DB & select password
  const user = await User.findById(req.user._id).select('+password');
  const { currentPassword, newPassword } = req.body;
  // 2) Check If current password is correct

  if (!(await user.isCorrectPassword(currentPassword))) {
    return next(new AppError(errorDefinitions.AUTH.INVALID_CREDENTIALS));
  }

  // 3) Update password and save
  user.password = newPassword;
  await user.save({ validateModifiedOnly: true });

  // 4) Send new access token & respond to user
  const token = await signToken(user._id);
  setJwtCookie(res, token);
  res.status(200).json({
    status: 'success',
    user,
  });
});
