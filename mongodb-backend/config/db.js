const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Configure connection pooling for better performance
    const poolSize = process.env.MONGODB_POOL_SIZE || 10;

    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://GPC:anmol4328@gpc-itarsi.puza0ta.mongodb.net/gpc-itarsi', {
      // These options are no longer needed in newer mongoose versions but kept for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Connection pool configuration
      maxPoolSize: parseInt(poolSize),
      minPoolSize: 2,
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    });

    // Configure mongoose for better performance
    mongoose.set('bufferCommands', false); // Disable buffering for better error handling

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    console.log(`Connection Pool Size: ${poolSize}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
