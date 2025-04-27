const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Simple test server running on port ${PORT}`);
}); 