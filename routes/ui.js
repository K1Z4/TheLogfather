/**
 * UI Routes - The Logfather
 * "The interface that commands respect."
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createUiRoutes(config) {
  const router = express.Router();

  /**
   * GET / - Serve the main log viewer interface
   */
  router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  /**
   * GET /health - Health check endpoint
   */
  router.get('/health', (req, res) => {
    res.json({
      status: 'alive',
      service: 'The Logfather',
      tagline: 'We tail everything.',
      timestamp: new Date().toISOString(),
      config: {
        logPaths: config.logPaths,
        maxFileSize: config.maxFileSize,
        pageSize: config.pageSize
      }
    });
  });

  return router;
}

export default createUiRoutes;