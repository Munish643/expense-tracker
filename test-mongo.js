const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Simple test function
async function testMongoConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    };
    
    // Try to connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://Munish:Munish23@cluster0.xuptaas.mongodb.net/Expense2?retryWrites=true&w=majority';
    console.log(`Connecting to: ${mongoURI.split('@')[1]}`);
    
    await mongoose.connect(mongoURI, options);
    
    console.log('Successfully connected to MongoDB!');
    console.log(`Connected to: ${mongoose.connection.host}`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed successfully');
    
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:');
    console.error(error);
    
    // Provide more helpful error messages based on the error type
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB server. Please check:');
      console.error('1. Your internet connection');
      console.error('2. MongoDB Atlas is running');
      console.error('3. Your IP address is whitelisted in MongoDB Atlas');
    } else if (error.name === 'MongoParseError') {
      console.error('Invalid MongoDB connection string. Please check your MONGO_URI in .env file.');
    } else if (error.name === 'MongoNetworkError') {
      console.error('Network error connecting to MongoDB. Please check your network connection.');
    }
    
    return false;
  }
}

// Run the test
testMongoConnection(); 