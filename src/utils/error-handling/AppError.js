/**
 * Custom application error class for standardized error handling.
 *
 * @class
 * @extends Error
 *
 * @param {Object} options - Error options.
 * @param {string} options.message - Error message.
 * @param {number} [options.statusCode=400] - HTTP status code.
 * @param {string} [options.type='app_error'] - Type of error.
 * @param {string} [options.code='APP_ERROR'] - Error code identifier.
 * @param {Array} [options.details=[]] - Additional error details.
 *   Each detail should be an object with the shape:
 *   { field: String, value: any, message?: String }
 * @param {boolean} [options.isOperational=true] - Indicates if error is operational.
 *
 * @property {string} name - Name of the error class.
 * @property {number} statusCode - HTTP status code.
 * @property {string} status - Status string ('fail' for 4xx, 'error' otherwise).
 * @property {string} type - Type of error.
 * @property {string} code - Error code identifier.
 * @property {Array} details - Additional error details.
 * @property {boolean} isOperational - Indicates if error is operational.
 */
export class AppError extends Error {
  constructor({
    message,
    statusCode,
    type ,
    code,
    details = [],
  }) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.type = type;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

