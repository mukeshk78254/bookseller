#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Jira Seller API...\n');

// Check if MongoDB is running
const checkMongoDB = () => {
  return new Promise((resolve) => {
    const mongo = spawn('mongod', ['--version'], { stdio: 'pipe' });
    mongo.on('close', (code) => {
      if (code === 0) {
        console.log('✅ MongoDB is available');
        resolve(true);
      } else {
        console.log('⚠️  MongoDB might not be running. Please start MongoDB first.');
        console.log('   You can start MongoDB with: mongod');
        resolve(false);
      }
    });
  });
};

// Start the server
const startServer = () => {
  const serverPath = path.join(__dirname, '..', 'server.js');
  const server = spawn('node', [serverPath], { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  server.on('close', (code) => {
    console.log(`\n🛑 Server stopped with code ${code}`);
  });

  server.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
  });
};

// Main execution
const main = async () => {
  try {
    const mongoAvailable = await checkMongoDB();
    
    if (mongoAvailable) {
      console.log('📦 Starting server...\n');
      startServer();
    } else {
      console.log('\n💡 To start MongoDB:');
      console.log('   - Install MongoDB: https://docs.mongodb.com/manual/installation/');
      console.log('   - Start MongoDB: mongod');
      console.log('   - Or use MongoDB Atlas: https://www.mongodb.com/atlas');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error starting application:', error);
    process.exit(1);
  }
};

main();
