/**
 * API Routes - The Logfather
 * "The API that makes offers you can't refuse."
 */

import express from 'express';
import { scanLogDirectories, readLogFile } from '../lib/fileReader.js';
import { parseLogContent } from '../lib/logParser.js';
import { LogSearchEngine } from '../lib/searchEngine.js';

function createApiRoutes(config) {
  const router = express.Router();
  const searchEngine = new LogSearchEngine();
  let lastScanTime = null;

  // Middleware for JSON parsing
  router.use(express.json());

  /**
   * GET /api/logs - Search and filter logs
   */
  router.get('/logs', async (req, res) => {
    try {
      const {
        q = '',           // Search query
        level = null,     // Log level filter
        startDate = null, // Start date filter
        endDate = null,   // End date filter
        page = 1,         // Page number
        pageSize = config.pageSize || 100,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = req.query;

      // Ensure logs are loaded
      await ensureLogsLoaded();

      // Perform search
      const results = searchEngine.search(q, {
        level,
        startDate,
        endDate,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        sortBy,
        sortOrder
      });

      res.json({
        success: true,
        data: results,
        meta: {
          lastScanTime,
          config: {
            logPaths: config.logPaths
          }
        }
      });
          } catch (error) {
        config.logger.error('The Logfather encountered an error during search:', error);
        res.status(500).json({
          success: false,
          error: 'Search operation failed',
          message: error.message
        });
      }
  });

  /**
   * POST /api/refresh - Refresh log data from files
   */
  router.post('/refresh', async (req, res) => {
    try {
      await loadLogs();
      
      res.json({
        success: true,
        message: 'Logs refreshed successfully',
        data: {
          lastScanTime,
          stats: searchEngine.getIndexStats()
        }
      });
          } catch (error) {
        config.logger.error('The Logfather encountered an error during refresh:', error);
        res.status(500).json({
          success: false,
          error: 'Refresh operation failed',
          message: error.message
        });
      }
  });

  /**
   * GET /api/stats - Get index statistics
   */
  router.get('/stats', async (req, res) => {
    try {
      await ensureLogsLoaded();
      
      const stats = searchEngine.getIndexStats();
      
      res.json({
        success: true,
        data: {
          ...stats,
          lastScanTime,
          logPaths: config.logPaths
        }
      });
          } catch (error) {
        config.logger.error('The Logfather encountered an error getting stats:', error);
        res.status(500).json({
          success: false,
          error: 'Stats operation failed',
          message: error.message
        });
      }
  });

  /**
   * GET /api/files - Get list of log files
   */
  router.get('/files', async (req, res) => {
    try {
      const files = await scanLogDirectories(config.logPaths);
      
      res.json({
        success: true,
        data: files.map(file => ({
          name: file.name,
          path: file.path,
          size: file.size,
          lastModified: file.lastModified,
          level: file.level,
          directory: file.directory
        }))
      });
          } catch (error) {
        config.logger.error('The Logfather encountered an error listing files:', error);
        res.status(500).json({
          success: false,
          error: 'File listing failed',
          message: error.message
        });
      }
  });

  /**
   * GET /api/entry/:id - Get specific log entry details
   */
  router.get('/entry/:id', async (req, res) => {
    try {
      await ensureLogsLoaded();
      
      const entryId = req.params.id;
      const entry = searchEngine.entries.find(e => e.id === entryId);
      
      if (!entry) {
        return res.status(404).json({
          success: false,
          error: 'Log entry not found',
          message: `Entry with ID ${entryId} not found`
        });
      }
      
      res.json({
        success: true,
        data: entry
      });
          } catch (error) {
        config.logger.error('The Logfather encountered an error getting entry:', error);
        res.status(500).json({
          success: false,
          error: 'Entry retrieval failed',
          message: error.message
        });
      }
  });

  /**
   * Load logs from files into search engine
   */
  async function loadLogs() {
    config.logger.log('The Logfather is scanning for logs...');
    
    const files = await scanLogDirectories(config.logPaths, config.logger);
    const allEntries = [];
    
    for (const file of files) {
      try {
        const content = await readLogFile(file.path, config.logger);
        const entries = parseLogContent(content, file.path);
        allEntries.push(...entries);
      } catch (error) {
        config.logger.warn(`The Logfather couldn't read file: ${file.path}`, error.message);
      }
    }
    
    searchEngine.indexEntries(allEntries);
    lastScanTime = new Date();
    
    config.logger.log(`The Logfather indexed ${allEntries.length} log entries from ${files.length} files.`);
  }

  /**
   * Ensure logs are loaded (lazy loading)
   */
  async function ensureLogsLoaded() {
    if (!lastScanTime) {
      await loadLogs();
    }
  }

  return router;
}

export default createApiRoutes;