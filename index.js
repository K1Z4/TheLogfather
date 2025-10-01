/**
 * The Logfather - Express Log Viewer Plugin
 * "We tail everything."
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import uiRoutes from './routes/ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create The Logfather middleware
 * @param {Object} options - Configuration options
 * @param {Array<string>} options.logPaths - Array of log directory paths to scan
 * @param {number} options.pageSize - Number of log entries per page (default: 100)
 * @param {Object} options.logger - Logger instance (default: console)
 * @returns {Function} Express middleware function
 */
function createLogfatherMiddleware(options = {}) {
  const config = {
    logPaths: options.logPaths || [],
    pageSize: options.pageSize || 100,
    logger: options.logger || console,
    ...options
  };

  if (!config.logPaths || config.logPaths.length === 0) {
    throw new Error('The Logfather requires at least one log path. You cannot escape the family.');
  }

  const router = express.Router();

  // Serve static assets (CSS, JS, images)
  router.use('/static', express.static(path.join(__dirname, 'public')));

  // API routes for log data
  router.use('/api', apiRoutes(config));

  // UI routes for serving the log viewer interface
  router.use('/', uiRoutes(config));

  return router;
}

export default createLogfatherMiddleware;