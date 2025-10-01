/**
 * File Reader Module - The Logfather
 * "Every file tells a story. We read them all."
 */

import fs from 'fs';
import path from 'path';

const { promises: fsPromises } = fs;

/**
 * Scan directories for log files matching debug* and error* patterns
 * @param {Array<string>} logPaths - Array of directory paths to scan
 * @param {Object} logger - Logger instance to use
 * @returns {Promise<Array<Object>>} Array of file info objects
 */
async function scanLogDirectories(logPaths, logger = console) {
  const allFiles = [];
  
  for (const logPath of logPaths) {
    try {
      const files = await scanSingleDirectory(logPath);
      allFiles.push(...files);
    } catch (error) {
      logger.warn(`The Logfather couldn't access directory: ${logPath}`, error.message);
    }
  }
  
  return allFiles.sort((a, b) => b.lastModified - a.lastModified);
}

/**
 * Scan a single directory for log files
 * @param {string} dirPath - Directory path to scan
 * @returns {Promise<Array<Object>>} Array of file info objects
 */
async function scanSingleDirectory(dirPath) {
  try {
    const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
    const logFiles = [];
    
    for (const entry of entries) {
      if (entry.isFile() && isLogFile(entry.name)) {
        const filePath = path.join(dirPath, entry.name);
        const stats = await fsPromises.stat(filePath);
        
        logFiles.push({
          name: entry.name,
          path: filePath,
          size: stats.size,
          lastModified: stats.mtime,
          level: extractLogLevel(entry.name),
          directory: dirPath
        });
      }
    }
    
    return logFiles;
  } catch (error) {
    throw new Error(`Failed to scan directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Check if filename matches log file pattern
 * @param {string} filename - File name to check
 * @returns {boolean} True if file is a log file
 */
function isLogFile(filename) {
  return /^(debug|error)(\d+)?\.log$/.test(filename);
}

/**
 * Extract log level from filename
 * @param {string} filename - File name
 * @returns {string} Log level (debug or error)
 */
function extractLogLevel(filename) {
  return filename.startsWith('debug') ? 'debug' : 'error';
}

/**
 * Read log file contents
 * @param {string} filePath - Path to log file
 * @param {Object} logger - Logger instance to use
 * @returns {Promise<string>} File contents
 */
async function readLogFile(filePath, logger = console) {
  try {
    return await fsPromises.readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read log file ${filePath}: ${error.message}`);
  }
}

/**
 * Get file metadata without reading contents
 * @param {Array<string>} filePaths - Array of file paths
 * @param {Object} logger - Logger instance to use
 * @returns {Promise<Array<Object>>} Array of file metadata
 */
async function getFileMetadata(filePaths, logger = console) {
  const metadata = [];
  
  for (const filePath of filePaths) {
    try {
      const stats = await fsPromises.stat(filePath);
      const filename = path.basename(filePath);
      
      metadata.push({
        name: filename,
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime,
        level: extractLogLevel(filename),
        directory: path.dirname(filePath)
      });
    } catch (error) {
      logger.warn(`The Logfather couldn't access file: ${filePath}`, error.message);
    }
  }
  
  return metadata;
}

export {
  scanLogDirectories,
  scanSingleDirectory,
  isLogFile,
  extractLogLevel,
  readLogFile,
  getFileMetadata
};