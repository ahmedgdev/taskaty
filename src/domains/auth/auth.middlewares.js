import catchAsync from '../../utils/error-handling/catchAsync.js';
import { extractToken, verifyToken } from './token.js';
import User from '../user/user.model.js';
import { AppError } from '../../utils/error-handling/AppError.js';
import errorDefinitions from '../../utils/error-handling/errorDefinitions.js';

export const protect = catchAsync(async (req, res, next) => {
  // 1) GET TOKEN
  const token = extractToken(req);
  if (!token) {
    return next(new AppError(errorDefinitions.AUTH.TOKEN_MISSING));
  }

  // 2) VERIFY TOKEN
  // Verification errors handled in globalErrorHandler
  const decoded = await verifyToken(token);

  // 3) CHECK IF USER NO LONGER EXISTS
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError(errorDefinitions.AUTH.USER_NO_LONGER_EXIST));
  }

  // 4) CHECK IF PASSWORD CHANGED AFTER TOKEN ISSUED
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError(errorDefinitions.AUTH.TOKEN_EXPIRED));
  }
  // 5) ADD USER TO Req & GRANT ACCESS
  req.user = user;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(errorDefinitions.AUTH.FORBIDDEN));
    }
    next();
  };
};
