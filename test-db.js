require('dotenv').config();
const mongoose = require('mongoose');
const color = require('colors');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...'.yellow);
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    };

    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://Munish:Munish23@cluster0.xuptaas.mongodb.net/Expense2?retryWrites=true&w=majority';
    console.log('Connecting to MongoDB...'.yellow);
    
    await mongoose.connect(mongoURI, options);
    console.log('MongoDB connection successful!'.green);
    console.log(`Connected to: ${mongoose.connection.host}`.green);
    
    await mongoose.connection.close();
    console.log('Connection closed successfully'.green);
    
    return true;
  } catch (error) {
    console.error('MongoDB connection error:'.red, error);
    console.error('Error stack:'.red, error.stack);
    return false;
  }
}

// Run the test
testConnection().then(success => {
  if (!success) {
    process.exit(1);
  }
}); 