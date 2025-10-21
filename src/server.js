process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION', err);
  process.exit(1);
});

// Load environment and modules
import app from './app.js';
import { connectDB } from './config/db.js';

// Start server
const startServer = async () => {
  try {
    await connectDB();

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
};

startServer();
