/* A Function That Return A Validation Middleware For Joi */

import { AppError } from '../error-handling/AppError';
import errorDefinitions from '../error-handling/errorDefinitions';

const formatError = (error) => {
  const details = error.details.map((detail) => {
    return {
      field: detail.path.join('.'),
      message: detail.message,
    };
  });
  return new AppError({
    ...errorDefinitions.VALIDATION.INVALID_INPUT,
    details,
  });
};

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const options = {
        abortEarly: false,
        stripUnknown: true,
        convert: property === 'query',
      };

      const { error, value } = schema.validate(req[property], options);

      if (error) {
        const err = formatError(error);
        return next(err);
      }

      if (property === 'body') req[property] = value;
      return next();
    } catch (err) {
      return next(err);
    }
  };
};

export default validate;
