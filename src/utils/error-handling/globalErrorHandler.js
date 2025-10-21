import mongoose from 'mongoose';
import { AppError } from './AppError.js';
import errorDefinitions from './errorDefinitions.js';
import { errors } from 'jose';

const handleCastErrorDB = (err) => {
  const details = [{ field: err.path, value: err.value }];
  const appError = new AppError({
    ...errorDefinitions.VALIDATION.TYPE_MISSMATCH,
    details,
  });
  appError.originalStack = err.stack;
  return appError;
};

const handleDuplicateFieldsErrorDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const details = { field, value };

  return new AppError({
    ...errorDefinitions.VALIDATION.DUPLICATE_VALUE,
    details,
  });
};

const handleValidationErrorDB = (err) => {
  const details = Object.values(err.errors).map((el) => {
    return { field: el.path, message: el.message };
  });

  return new AppError({
    ...errorDefinitions.VALIDATION.INVALID_INPUT,
    details,
  });
};

const handleJWTError = () => {
  return new AppError(errorDefinitions.AUTH.TOKEN_INVALID);
};

const handleJWTExpiredError = () => {
  return new AppError(errorDefinitions.AUTH.TOKEN_EXPIRED);
};

const sendErrorDev = (err, res) => {
  console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    error: {
      message: err.message,
      type: err.type,
      code: err.code,
      details: err.details,
      route: err.route,
      timestamp: err.timestamp,
      stack: err.stack,
    },
  });
};

const sendErrorProd = (err, res) => {
  // Trusted Error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: {
        message: err.message,
        type: err.type,
        code: err.code,
        details: err.details,
        route: err.route,
        timestamp: err.timestamp,
      },
    });
  }

  // Unexpected Error
  console.error('Unexpected Error', err);
  res.status(err.statusCode).json({
    status: err.status,
    error: {
      type: 'server_error',
      message: 'Something went wrong',
      route: err.route,
      timestamp: err.timestamp,
    },
  });
};

const globalErrorHanlder = (err, req, res, next) => {
  // 1) Default to programming error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.type = err.type || 'server_error';

  // 2) Deep copy err (preserve both 'prototype chain' and 'object own properties)
  let error = Object.create(
    Object.getPrototypeOf(err),
    Object.getOwnPropertyDescriptors(err),
  );

  // 3) Handle unhandled operational errors (DB & JWT)
  if (error instanceof mongoose.Error.CastError)
    error = handleCastErrorDB(error);
  if (error instanceof mongoose.Error.ValidationError)
    error = handleValidationErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsErrorDB(error);

  if (error instanceof errors.JWTExpired) error = handleJWTExpiredError();
  if (
    error instanceof errors.JWTInvalid ||
    error instanceof errors.JWSInvalid ||
    error instanceof errors.JWSSignatureVerificationFailed
  ) {
    error = handleJWTError();
  }

  // 4) Set error timestamp
  error.timestamp = new Date().toISOString();
  // 5) Send Error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

export default globalErrorHanlder;
