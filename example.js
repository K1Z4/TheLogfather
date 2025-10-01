/**
 * The Logfather - Example Usage
 * "A demonstration that commands respect."
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import logfatherPlugin from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// The Logfather setup - pointing to our test logs
app.use('/logs', logfatherPlugin({
  logPaths: [
    path.join(__dirname, 'test-logs')
  ],
  pageSize: 50,
  logger: console // You can replace this with your own logger
}));

// Simple home route that redirects to The Logfather
app.get('/', (req, res) => {
  res.redirect('/logs');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'alive',
    service: 'Example App with The Logfather',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log('');
  console.log('════════════════════════════════════════════════════════════');
  console.log('                    THE LOGFATHER                          ');
  console.log('                 "We tail everything"                      ');
  console.log('════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`🎭 The Logfather is ready and listening on port ${PORT}`);
  console.log(`📊 View your logs at: http://localhost:${PORT}/logs`);
  console.log(`❤️  Health check at: http://localhost:${PORT}/health`);
  console.log('');
  console.log('Log directories being watched:');
  console.log(`   - ${path.join(__dirname, 'test-logs')}`);
  console.log('');
  console.log('Press Ctrl+C to stop The Logfather');
  console.log('════════════════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  console.log('The Logfather is shutting down...');
  console.log('Arrivederci.');
  process.exit(0);
});