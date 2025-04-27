const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const color = require('colors');
const path = require('path');
const connectdb = require('./config/db');
const Expense = require('./models/Expense');
const User = require('./models/user');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('frontend')); // Serve frontend files from the frontend directory

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Root route to show "Hi from server"
app.get('/', (req, res) => {
  res.send('Hi from server');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to database and start server
const PORT = 8080; // Always use port 8080

// Function to find an available port
const findAvailablePort = async (startPort) => {
  const net = require('net');
  
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Try to kill any process using the port
        console.log(`Port ${startPort} is in use. Attempting to free it...`.yellow);
        
        // On Windows, try to find and kill the process using the port
        if (process.platform === 'win32') {
          const { execSync } = require('child_process');
          try {
            // Find the process ID using the port
            const output = execSync(`netstat -ano | findstr :${startPort}`).toString();
            const lines = output.split('\n');
            for (const line of lines) {
              if (line.includes('LISTENING')) {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid) {
                  console.log(`Attempting to kill process ${pid} using port ${startPort}...`.yellow);
                  execSync(`taskkill /F /PID ${pid}`);
                  console.log(`Process ${pid} killed successfully.`.green);
                  
                  // Wait a moment for the port to be released
                  setTimeout(() => {
                    server.listen(startPort);
                  }, 1000);
                  return;
                }
              }
            }
          } catch (error) {
            console.log(`Could not free port ${startPort}: ${error.message}`.red);
          }
        }
        
        // If we couldn't free the port, exit with an error
        console.log(`Could not free port ${startPort}. Please free up port ${startPort} and try again.`.red);
        process.exit(1);
      } else {
        reject(err);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(startPort);
    });
    
    server.listen(startPort);
  });
};

// Wrap the database connection and server start in a try-catch block
const startServer = async () => {
  try {
    console.log('Starting server...'.yellow);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`.yellow);
    console.log(`Using port: ${PORT}`.yellow);
    
    // Connect to MongoDB
    console.log('Connecting to database...'.yellow);
    await connectdb();
    console.log('Database connected successfully'.green);
    
    // Find an available port starting from the configured port
    const availablePort = await findAvailablePort(PORT);
    
    // Start the server
    const server = app.listen(availablePort, () => {
      console.log(`Server is running on port ${availablePort}`.green.bold);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${availablePort} is already in use`.red);
        process.exit(1);
      }
    });

    // Handle process errors
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (error) => {
      console.error('Unhandled Rejection:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:'.red, error);
    console.error('Error stack:'.red, error.stack);
    process.exit(1);
  }
};

// Start the server
startServer();
