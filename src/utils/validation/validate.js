import * as z from 'zod';
import { AppError } from '../error-handling/AppError.js';
import errorDefinitions from '../error-handling/errorDefinitions.js';

/**
 * Wrapper function that returns a schema bound validation middleware
 * 1. recieve schema
 * 2. return middleware
 *  - validate input against schema
 *  - if success -> replace req with validated data
 *  - if error -> format errors & propagate
 */

const formatError = (error) => {
  const details = error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return new AppError({
    ...errorDefinitions.VALIDATION.INVALID_INPUT,
    details,
  });
};

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);

    if (result.success) {
      req[property] = result.data;
      return next();
    }
    const error = formatError(result.error);
    return next(error);
  };
};

export default validate;
