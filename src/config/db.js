import mongoose from 'mongoose';

// Connection options tuned for production
const options = {
  maxPoolSize: 10, // Max simultaneous connections
  minPoolSize: 2, // Min idle connections
  socketTimeoutMS: 45000, // Close idle sockets after 45s
  serverSelectionTimeoutMS: 10000, // Fail fast if DB is unreachable
  retryWrites: true, // Retry failed writes
  retryReads: true, // Retry failed reads
  autoIndex: process.env.NODE_ENV !== 'production',
};

// Main connection function
export const connectDB = async () => {
  const dbUri = process.env.MONGO_URI;

  if (!dbUri) {
    throw new Error('MongoDB URI is missing in environment variables!');
  }

  try {
    const conn = await mongoose.connect(dbUri, options);
    console.log('Mongoose connected to DB successfully✅');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Connection events
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose disconnected from DB');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err.message);
    throw err;
  }
};

