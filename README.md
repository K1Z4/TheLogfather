# The Logfather

> *"We tail everything."*

A powerful, Node.js Express plugin that provides a sophisticated log viewer interface with search and filtering capabilities. Inspired by tools like Seq, but designed to work with simple file-based logs without external dependencies.

⚠️ **SECURITY WARNING**: The Logfather provides read-only access to your log files, which may contain sensitive information. **ALWAYS protect the routes with authentication in production environments.**

![The Logfather Interface](https://img.shields.io/badge/Interface-Godfather%20Themed-8b1538?style=for-the-badge)
![Dependencies](https://img.shields.io/badge/Dependencies-Express%20Only-green?style=for-the-badge)
![ES6 Modules](https://img.shields.io/badge/ES6-Modules-blue?style=for-the-badge)
![Native Fetch](https://img.shields.io/badge/Fetch-Native%20API-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## Features

### 🎭 **The Family's Capabilities**
- **Full-text search** across all log entries
- **Advanced filtering** by log level, date range, and source file
- **Pagination** for handling large log volumes
- **In-memory indexing** for fast search performance
- **Manual refresh** to reload logs from files
- **Godfather-themed UI** that commands respect
- **No external dependencies** beyond Express
- **Modern ES6 modules** throughout the codebase
- **Native Fetch API** - No external HTTP client needed
- **Security-focused** - Designed for protected environments

### 📊 **Log Format Support**
- **JSON log entries** (primary format)
- **Plain text fallback** for non-structured logs
- **Multiple log levels**: debug, info, warning, error
- **Timestamp parsing** from various formats

### 🔍 **Search & Filter Options**
- **Text search** with highlighting
- **Log level filtering**
- **Date range filtering**
- **Source file filtering**
- **Sortable columns**
- **Real-time result counts**

## Installation

```bash
npm install the-logfather
```

⚠️ **IMPORTANT**: Before using The Logfather in production, ensure you have proper authentication middleware in place to protect access to your log files.

## Quick Start

```javascript
import express from 'express';
import logfatherPlugin from 'the-logfather';

const app = express();

// ⚠️ SECURITY: ALWAYS protect The Logfather routes with authentication!
// The Logfather provides read-only access to your log files, which may contain sensitive data.

// Example with basic authentication middleware
app.use('/logs', (req, res, next) => {
    // Add your authentication logic here
    // Example: Check for valid session, API key, or JWT token
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}, logfatherPlugin({
    express: express,
    logPaths: ['/path/to/your/logs/']
}));

app.listen(3000, () => {
    console.log('The Logfather is ready: http://localhost:3000/logs');
});
```

## Configuration Options

```javascript
// 🔒 SECURITY: ALWAYS add authentication middleware before The Logfather
app.use('/logs', authenticateUser, logfatherPlugin({
  express: express,                 // Required: An instance of Express
  logPaths: ['/path/to/logs/'],     // Required: Array of log directory paths
  pageSize: 100,                   // Optional: Results per page (default: 100)
  logger: console                  // Optional: Logger instance (default: console)
}));
```

### Logger Configuration

The Logfather accepts any logger that implements the standard console interface (`log`, `warn`, `error`). You can use:

- **Console (default)**: `logger: console`
- **Winston**: `logger: winston`
- **Pino**: `logger: pino`
- **Custom logger**: Any object with `log`, `warn`, `error` methods

Example with Winston:
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logfather.log' })
  ]
});

// 🔒 SECURITY: Remember to add authentication!
app.use('/logs', authenticateUser, logfatherPlugin({
  logPaths: ['/path/to/logs/'],
  logger: logger
}));
```
## Log File Structure

The Logfather expects a specific file naming pattern:
- **Debug logs**: `debug.log`, `debug1.log`, `debug2.log`, etc.
- **Error logs**: `error.log`, `error1.log`, `error2.log`, etc.

### Supported Log Formats

**JSON Format (Recommended):**
```json
{"level":"info","message":"User logged in","timestamp":"2025-01-20T10:00:00.000Z"}
{"level":"error","message":"Database connection failed","timestamp":"2025-01-20T10:05:00.000Z"}
```

**Plain Text (Fallback):**
```
2025-01-20 10:00:00 INFO User logged in
2025-01-20 10:05:00 ERROR Database connection failed
```

## API Endpoints

Once mounted, The Logfather provides these endpoints:

### Web Interface
- `GET /logs` - Main log viewer interface

## Search Query Examples

| Query | Description |
|-------|-------------|
| `error database` | Find entries containing "error" and "database" |
| `user login` | Search for user login events |
| `timeout connection` | Find connection timeout issues |
| `payment failed` | Search payment-related failures |

## UI Features

### 🎭 **Godfather Theme**
- Dark, cinematic interface
- High-contrast design for readability
- Serif fonts for headers, monospace for logs
- Deep red accents throughout
- Always-visible avatar from the family

### ⌨️ **Keyboard Shortcuts**
- `Ctrl/Cmd + K` - Focus search input
- `Ctrl/Cmd + R` - Refresh logs
- `F5` - Refresh logs
- `Enter` - Execute search

### 🌐 **Modern Web Standards**
- **Native Fetch API** - No external HTTP client dependencies
- **URLSearchParams** - Modern query parameter handling
- **ES6 Modules** - Modern JavaScript throughout

### 📱 **Responsive Design**
- Mobile-optimized layout
- Collapsible columns on small screens
- Touch-friendly controls

## Performance Considerations

- **Memory Usage**: Logs are indexed in memory for fast searching
- **Scan Frequency**: Manual refresh only - no automatic file watching
- **Concurrent Users**: Shared in-memory index supports multiple users

## Requirements

- **Node.js**: 14.0.0 or higher (ES6 module support)
- **Express**: 4.x or higher
- **ES6 Environment**: Requires `"type": "module"` in package.json

## License

MIT License

