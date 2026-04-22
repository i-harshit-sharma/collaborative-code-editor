/**
 * ANSI Color codes for terminal logs
 */
const colors = {
  reset: '\x1b[0m',
  info: '\x1b[36m',    // Cyan
  success: '\x1b[32m', // Green
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red
  debug: '\x1b[90m',   // Gray
  timestamp: '\x1b[35m' // Magenta
};

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatMessage = (level, message, color) => {
  const ts = `${colors.timestamp}[${getTimestamp()}]${colors.reset}`;
  const lvl = `${color}[${level}]${colors.reset}`;
  return `${ts} ${lvl} ${message}`;
};

export const logger = {
  info: (message, ...args) => {
    console.log(formatMessage('INFO', message, colors.info), ...args);
  },
  success: (message, ...args) => {
    console.log(formatMessage('SUCCESS', message, colors.success), ...args);
  },
  warn: (message, ...args) => {
    console.warn(formatMessage('WARN', message, colors.warn), ...args);
  },
  error: (message, ...args) => {
    console.error(formatMessage('ERROR', message, colors.error), ...args);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatMessage('DEBUG', message, colors.debug), ...args);
    }
  }
};

export default logger;
