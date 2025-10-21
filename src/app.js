import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import morgan from 'morgan';
import compression from 'compression';
import globalErrorHandler from './utils/error-handling/globalErrorHandler.js';
import { AppError } from './utils/error-handling/AppError.js';
import errorDefinitions from './utils/error-handling/errorDefinitions.js';
import authRouter from './domains/auth/auth.routes.js';
import makeQueryMutable from './middlewares/makeQueryMutable.js';

/* CREATE EXPRESS APP & SET EXPRESS SETTINGS */
const app = express();
app.set('query parser', 'extended');

/* GLOBAL MIDDLEWARES */
// security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }),
);

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, Please try again in an hour',
});
app.use(limiter);
app.use(cors()); // to add: trusted domains
// parsing
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());

// --------- test --------
app.use(makeQueryMutable);

//  --------------------
// // Data sanitization
app.use(ExpressMongoSanitize());
app.use(xss());
app.use(hpp()); // to add: whitelist

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// compression
app.use(compression());

/* ROUTE MOUNTING */
app.get('/', (req, res) => {
  res.send('<h1>Welcome to Home Page</h1>');
});

app.use('/api/v1/auth', authRouter);

/* HANDLE UNHANDLED ROUTES */
app.use((req, res, next) => {
  const details = {
    method: req.method,
    url: req.originalUrl,
  };
  return next(
    new AppError({ ...errorDefinitions.NOT_FOUND.ROUTE_NOT_FOUND, details }),
  );
});
/* GLOBAL ERROR HANDLER MIDDLEWARE */
app.use(globalErrorHandler);

export default app;
