import Email from '../../utils/email.js';
import { AppError } from '../../utils/error-handling/AppError.js';
import catchAsync from '../../utils/error-handling/catchAsync.js';
import errorDefinitions from '../../utils/error-handling/errorDefinitions.js';
import User from '../user/user.model.js';
import { signToken } from './token.js';

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
  res.status(201).json({
    status: 'success',
    token,
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
  res.status(200).json({
    status: 'success',
    token,
    user,
  });
});

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
  // 1. Extract resetToken from url
  // 2. Hash the Token
  // 3. Find User based on passwordResetToken & passwordResetExpires
  // -- _remember to validate passwordConfirm in zod
  // 4. Extract password
});

// UPDATE-PASSWORD
