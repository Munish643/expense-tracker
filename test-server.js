const http = require('http');

// Function to check if a port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use`);
        resolve(true);
      } else {
        console.log(`Port ${port} error: ${err.message}`);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      console.log(`Port ${port} is available`);
      resolve(false);
    });
    
    server.listen(port);
  });
}

// Function to test server connection
async function testServerConnection(port) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/api/auth/profile',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`Server on port ${port} responded with status: ${res.statusCode}`);
      resolve(res.statusCode < 400);
    });
    
    req.on('error', (err) => {
      console.log(`Error connecting to server on port ${port}: ${err.message}`);
      resolve(false);
    });
    
    req.end();
  });
}

// Main function
async function main() {
  console.log('Testing server connection...');
  
  // Check ports 8080-8085
  const ports = [8080, 8081, 8082, 8083, 8084, 8085];
  
  for (const port of ports) {
    const inUse = await checkPort(port);
    if (inUse) {
      console.log(`Testing connection to server on port ${port}...`);
      const connected = await testServerConnection(port);
      if (connected) {
        console.log(`\nSUCCESS: Server is running and accessible on port ${port}`);
        return;
      }
    }
  }
  
  console.log('\nERROR: Could not find a running server on any port between 8080-8085');
  console.log('Please make sure the server is running with: npm run dev');
}

main(); 