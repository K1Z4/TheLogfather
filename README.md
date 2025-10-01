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

## ES6 Module Support

The Logfather is built with modern ES6 modules throughout:

```javascript
// package.json includes "type": "module"
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import logfatherPlugin from 'the-logfather';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### Module Structure
```
├── index.js                 # ES6 default export
├── lib/                     # Functional ES6 modules
│   ├── fileReader.js        # Named exports
│   ├── logParser.js         # Named exports
│   └── searchEngine.js      # Named exports
└── routes/                  # Express route modules
    ├── api.js              # Default export
    └── ui.js               # Default export
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

### REST API
- `GET /logs/api/logs` - Search and retrieve log entries
- `POST /logs/api/refresh` - Refresh logs from files
- `GET /logs/api/stats` - Get indexing statistics
- `GET /logs/api/files` - List available log files
- `GET /logs/api/entry/:id` - Get specific log entry details

### Health & Status
- `GET /logs/health` - Service health check

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

## Example Usage

```javascript
// Basic setup with ES6 modules
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import logfatherPlugin from 'the-logfather';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// 🔒 SECURITY: Authentication middleware (REQUIRED for production)
const authenticateUser = (req, res, next) => {
  // Implement your authentication logic here
  // Example: Check JWT token, session, or API key
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !isValidToken(token)) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Valid authorization token required to access logs'
    });
  }
  
  next();
};

// Configure The Logfather with authentication
app.use('/logs', authenticateUser, logfatherPlugin({
  logPaths: [
    path.join(__dirname, 'logs'),
    '/var/log/myapp'
  ],
  pageSize: 50,
  logger: console // You can replace this with your own logger
}));

// Your existing routes
app.get('/', (req, res) => {
  res.send('App is running. View logs at <a href="/logs">/logs</a>');
});

app.listen(3000);
```

## Performance Considerations

- **Memory Usage**: Logs are indexed in memory for fast searching
- **Scan Frequency**: Manual refresh only - no automatic file watching
- **Concurrent Users**: Shared in-memory index supports multiple users

## Requirements

- **Node.js**: 14.0.0 or higher (ES6 module support)
- **Express**: 4.x or higher
- **ES6 Environment**: Requires `"type": "module"` in package.json

## Security Notes

⚠️ **CRITICAL**: The Logfather provides read-only access to your log files, which may contain sensitive information like passwords, API keys, user data, and system details.

### 🔒 **MANDATORY Security Requirements**

**1. Authentication Protection:**
```javascript
// ALWAYS protect The Logfather routes with authentication
app.use('/logs', authenticateUser, logfatherPlugin({
  logPaths: ['/path/to/logs/']
}));
```

**2. Network Security:**
- Deploy behind a reverse proxy (nginx, Apache)
- Use HTTPS in production
- Restrict network access to authorized IPs
- Consider VPN access for sensitive environments

**3. Access Control:**
- Implement role-based access control (RBAC)
- Log all access attempts
- Monitor for suspicious activity
- Regular security audits

**4. Data Protection:**
- Be aware that log contents will be visible in the web interface
- Consider log sanitization for sensitive data
- Implement data retention policies
- Encrypt sensitive log files at rest

### 🚨 **Security Examples**

**Basic Authentication:**
```javascript
app.use('/logs', (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !isValidToken(token)) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}, logfatherPlugin({ logPaths: ['/path/to/logs/'] }));
```

**Session-based Authentication:**
```javascript
app.use('/logs', (req, res, next) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, logfatherPlugin({ logPaths: ['/path/to/logs/'] }));
```

**API Key Authentication:**
```javascript
app.use('/logs', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Valid API key required' });
  }
  next();
}, logfatherPlugin({ logPaths: ['/path/to/logs/'] }));
```

## Contributing

The Logfather is a family business. We welcome contributions that maintain the dignity and respect of the codebase.

## License

MIT License - Because even the family believes in freedom.

---

*"In this business, you keep your friends close, and your logs closer."*

**The Logfather Development Team**