export default {
  AUTH: {
    INVALID_CREDENTIALS: {
      statusCode: 401,
      type: 'auth_error',
      code: 'INVALID_CREDENTIALS',
      message: 'Incorrect email or password',
    },
    TOKEN_MISSING: {
      statusCode: 401,
      type: 'auth_error',
      code: 'TOKEN_MISSING',
      message: 'Authentication required',
    },
    TOKEN_INVALID: {
      statusCode: 401,
      code: 'TOKEN_INVALID',
      type: 'auth_error',
      message: 'Authentication failed',
    },
    TOKEN_EXPIRED: {
      statusCode: 401,
      code: 'TOKEN_EXPIRED',
      type: 'auth_error',
      message: 'Authentication expired',
    },

    USER_NO_LONGER_EXIST: {
      statusCode: 401,
      code: 'USER_NO_LONGER_EXIST',
      type: 'auth_error',
      message: 'Account no longer exists',
    },
    FORBIDDEN: {
      statusCode: 403,
      code: 'FORBIDDEN',
      type: 'auth_error',
      message: 'Access denied',
    },
  },
  VALIDATION: {
    RESET_TOKEN_INVALID: {
      statusCode: 400,
      type: 'validation_error',
      code: 'RESET_TOKEN_INVALID',
      message: 'Password reset token is invalid or expired',
    },
    TYPE_MISSMATCH: {
      statusCode: 400,
      type: 'validation_error',
      code: 'TYPE_MISSMATCH',
      message: 'Invalid data type provided',
    },
    DUPLICATE_VALUE: {
      statusCode: 409,
      type: 'validation_error',
      code: 'DUPLICATE_VALUE',
      message:
        'Duplicate value for a unique field. Please use a different value.',
    },
    MISSING_FIELD: {
      statusCode: 400,
      type: 'validation_error',
      code: 'MISSING_FIELD',
      message: 'Required field is missing',
    },
    INVALID_INPUT: {
      statusCode: 400,
      type: 'validation_error',
      code: 'INVALID_INPUT',
      message: 'Invalid input data',
    },
  },
  NOT_FOUND: {
    ROUTE_NOT_FOUND: {
      statusCode: 404,
      type: 'not_found_error',
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested endpoint does not exist',
    },
    RESOURCE_NOT_FOUND: {
      statusCode: 404,
      code: 'RESOURCE_NOT_FOUND',
      type: 'not_found_error',
      message: 'The requested resource not found',
    },
  },
};
