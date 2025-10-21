import '../src/config/loadEnv.js';
import { connectDB } from '../src/config/db.js';
import User from '../src/domains/user/user.model.js';

connectDB();

const deleteAllUsers = async () => {
  const users = await User.deleteMany({});
  console.log('Users deleted❌');
  console.log(users);
  process.exit();
};

deleteAllUsers();
