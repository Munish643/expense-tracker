const mongoose = require('mongoose');
const color = require('colors');

const connectdb = async () => {
  try {
    // Set up connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    // Try to connect to MongoDB
    console.log('Attempting to connect to MongoDB...'.yellow);
    
    // Use MongoDB Atlas connection string
    const mongoURI = 'mongodb+srv://Munish:Munish23@cluster0.xuptaas.mongodb.net/Expense2?retryWrites=true&w=majority';
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI, options);
    
    // Set up error handlers for the connection
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    // Log success
    console.log(`Database connected successfully to ${mongoose.connection.host}`.bgGreen.white);
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:'.red, error.message);
    
    // Provide more helpful error messages based on the error type
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB. Please check:'.red);
      console.error('1. MongoDB is installed and running locally'.yellow);
      console.error('2. MongoDB service is started'.yellow);
      console.error('3. MongoDB is running on port 27017'.yellow);
    } else if (error.name === 'MongoParseError') {
      console.error('Invalid MongoDB connection string.'.red);
    } else if (error.name === 'MongoNetworkError') {
      console.error('Network error connecting to MongoDB. Please check if MongoDB is running.'.red);
    }
    
    // Exit the process with an error code
    process.exit(1);
  }
};

module.exports = connectdb;
