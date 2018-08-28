/**
 * Configurations of logger.
 */
const winston = require('winston');
const winstonRotator = require('winston-daily-rotate-file');

const consoleConfig = [
  new winston.transports.Console({
    'colorize': true
  })
];

const createLogger = new winston.Logger({
  'transports': consoleConfig
});

const logger = createLogger;

logger.add(winstonRotator, {
  'name': 'access-file',
  'level': 'info',
  'filename': './logs/dailyLogs.log',
  'json': false,
  'prepend': true
});

logger.add(winstonRotator, {
  'name': 'error-file',
  'level': 'error',
  'filename': './logs/dailyLogs.log',
  'json': false,
  'prepend': true
});

logger.add(winstonRotator, {
  'name': 'warn-file',
  'level': 'warn',
  'filename': './logs/dailyLogs.log',
  'json': false,
  'prepend': true
});

logger.add(winstonRotator, {
  'name': 'verbose-file',
  'level': 'verbose',
  'filename': './logs/dailyLogs.log',
  'json': false,
  'prepend': true
});

module.exports = {
  'logger': logger
};