/**
 * Log Parser Module - The Logfather
 * "Every line has a story. We parse them all."
 */

/**
 * Parse log file contents into structured log entries
 * @param {string} fileContent - Raw log file content
 * @param {string} filePath - Source file path for context
 * @returns {Array<Object>} Array of parsed log entries
 */
function parseLogContent(fileContent, filePath) {
  if (!fileContent || typeof fileContent !== 'string') {
    return [];
  }

  const lines = fileContent.split('\n').filter(line => line.trim());
  const entries = [];
  
  for (let i = 0; i < lines.length; i++) {
    const entry = parseLogLine(lines[i], filePath, i + 1);
    if (entry) {
      entries.push(entry);
    }
  }
  
  return entries;
}

/**
 * Parse a single log line
 * @param {string} line - Log line to parse
 * @param {string} filePath - Source file path
 * @param {number} lineNumber - Line number in file
 * @returns {Object|null} Parsed log entry or null if invalid
 */
function parseLogLine(line, filePath, lineNumber) {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(line);
    
    // Validate required fields
    if (!parsed.level || !parsed.message || !parsed.timestamp) {
      return createFallbackEntry(line, filePath, lineNumber);
    }
    
    return {
      id: generateEntryId(filePath, lineNumber),
      level: normalizeLogLevel(parsed.level),
      message: cleanMessage(parsed.message),
      timestamp: parseTimestamp(parsed.timestamp),
      sourceFile: filePath,
      lineNumber: lineNumber,
      raw: line,
      isStructured: true
    };
  } catch (error) {
    // Fall back to plain text parsing
    return createFallbackEntry(line, filePath, lineNumber);
  }
}

/**
 * Create a fallback entry for non-JSON log lines
 * @param {string} line - Raw log line
 * @param {string} filePath - Source file path
 * @param {number} lineNumber - Line number
 * @returns {Object} Fallback log entry
 */
function createFallbackEntry(line, filePath, lineNumber) {
  const level = inferLogLevel(line, filePath);
  const timestamp = inferTimestamp(line);
  
  return {
    id: generateEntryId(filePath, lineNumber),
    level: level,
    message: line.trim(),
    timestamp: timestamp,
    sourceFile: filePath,
    lineNumber: lineNumber,
    raw: line,
    isStructured: false
  };
}

/**
 * Generate unique ID for log entry
 * @param {string} filePath - Source file path
 * @param {number} lineNumber - Line number
 * @returns {string} Unique entry ID
 */
function generateEntryId(filePath, lineNumber) {
  const filename = filePath.split('/').pop() || filePath;
  return `${filename}:${lineNumber}`;
}

/**
 * Normalize log level to standard values
 * @param {string} level - Raw log level
 * @returns {string} Normalized log level
 */
function normalizeLogLevel(level) {
  if (!level) return 'unknown';
  
  const normalized = level.toLowerCase().trim();
  
  // Map common variations
  const levelMap = {
    'err': 'error',
    'warn': 'warning',
    'info': 'info',
    'debug': 'debug',
    'trace': 'debug',
    'fatal': 'error'
  };
  
  return levelMap[normalized] || normalized;
}

/**
 * Clean and format log message
 * @param {string} message - Raw log message
 * @returns {string} Cleaned message
 */
function cleanMessage(message) {
  if (!message) return '';
  
  // Remove ANSI color codes
  const cleaned = message.replace(/\u001b\[\d+m/g, '');
  
  // Trim whitespace
  return cleaned.trim();
}

/**
 * Parse timestamp from various formats
 * @param {string} timestamp - Raw timestamp
 * @returns {Date} Parsed Date object
 */
function parseTimestamp(timestamp) {
  if (!timestamp) return new Date();
  
  // Handle ISO 8601 format (most common)
  const isoDate = new Date(timestamp);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }
  
  // Handle Unix timestamp
  const unixTime = parseInt(timestamp);
  if (!isNaN(unixTime)) {
    return new Date(unixTime * 1000);
  }
  
  // Fallback to current time
  return new Date();
}

/**
 * Infer log level from filename or content
 * @param {string} line - Log line content
 * @param {string} filePath - Source file path
 * @returns {string} Inferred log level
 */
function inferLogLevel(line, filePath) {
  // First try to infer from filename
  if (filePath.includes('error')) return 'error';
  if (filePath.includes('debug')) return 'debug';
  
  // Then try to infer from content
  const lowerLine = line.toLowerCase();
  if (lowerLine.includes('error') || lowerLine.includes('err')) return 'error';
  if (lowerLine.includes('warn')) return 'warning';
  if (lowerLine.includes('info')) return 'info';
  if (lowerLine.includes('debug')) return 'debug';
  
  return 'unknown';
}

/**
 * Infer timestamp from log line content
 * @param {string} line - Log line content
 * @returns {Date} Inferred timestamp or current time
 */
function inferTimestamp(line) {
  // Look for ISO 8601 timestamp patterns
  const isoMatch = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?/);
  if (isoMatch) {
    const date = new Date(isoMatch[0]);
    if (!isNaN(date.getTime())) return date;
  }
  
  // Look for simple date patterns
  const dateMatch = line.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
  if (dateMatch) {
    const date = new Date(dateMatch[0]);
    if (!isNaN(date.getTime())) return date;
  }
  
  // Fallback to current time
  return new Date();
}

/**
 * Filter log entries by criteria
 * @param {Array<Object>} entries - Log entries to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array<Object>} Filtered log entries
 */
function filterLogEntries(entries, filters = {}) {
  return entries.filter(entry => {
    // Level filter
    if (filters.level && entry.level !== filters.level) {
      return false;
    }
    
    // Date range filter
    if (filters.startDate && entry.timestamp < new Date(filters.startDate)) {
      return false;
    }
    if (filters.endDate && entry.timestamp > new Date(filters.endDate)) {
      return false;
    }
    
    // Source file filter
    if (filters.sourceFile && !entry.sourceFile.includes(filters.sourceFile)) {
      return false;
    }
    
    // Text search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return entry.message.toLowerCase().includes(searchTerm);
    }
    
    return true;
  });
}

export {
  parseLogContent,
  parseLogLine,
  createFallbackEntry,
  generateEntryId,
  normalizeLogLevel,
  cleanMessage,
  parseTimestamp,
  inferLogLevel,
  inferTimestamp,
  filterLogEntries
};