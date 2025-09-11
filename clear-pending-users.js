// Clear pending users script - for development/testing only
const mongoose = require('mongoose');
const PendingUser = require('./src/model/pendinguser');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/smart-farmer', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear all pending users
const clearPendingUsers = async () => {
  try {
    const result = await PendingUser.deleteMany({});
    console.log(`Cleared ${result.deletedCount} pending users`);
  } catch (error) {
    console.error('Error clearing pending users:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await clearPendingUsers();
  await mongoose.connection.close();
  console.log('Database connection closed');
  process.exit(0);
};

main();
