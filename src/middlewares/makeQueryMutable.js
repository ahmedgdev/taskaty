/**
 * Middleware to make `req.query` writable in Express 5.
 *
 * ⚠️ In Express 5, `req.query` is implemented as a getter on the `IncomingMessage`
 * prototype, making it **immutable**. This causes compatibility issues with
 * middlewares such as `express-mongo-sanitize` or any library that attempts
 * to mutate `req.query` directly (e.g., to remove unsafe input).
 *
 * This middleware redefines the `req.query` property on each request,
 * assigning it a copy of the original query object, and making it
 * writable, configurable, and enumerable again.
 *
 * This effectively restores the Express 4-style behavior where `req.query`
 * could be reassigned or modified safely.
 *
 * @function makeQueryMutable
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 *
 * @example
 * import { makeQueryMutable } from './middlewares/makeQueryMutable.js';
 * import mongoSanitize from 'express-mongo-sanitize';
 *
 * app.use(makeQueryMutable);
 * app.use(mongoSanitize());
 */

const makeQueryMutable = (req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
};

export default makeQueryMutable;
