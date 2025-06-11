// server/utils/enhanced-logger.js
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Certifique-se de que o diretório de logs existe
if (!fs.existsSync(path.join(__dirname, '../logs'))) {
  fs.mkdirSync(path.join(__dirname, '../logs'));
}

// Formato personalizado para os logs
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let metaStr = '';
  if (Object.keys(metadata).length > 0) {
    metaStr = JSON.stringify(metadata, null, 2);
  }
  return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
});

// Configuração do logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    customFormat
  ),
  defaultMeta: { service: 'gym-expert-api' },
  transports: [
    // Console output com cores
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      )
    }),
    // Arquivo para todos os logs
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log')
    }),
    // Arquivo separado para erros
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error'
    })
  ]
});

// Métodos adicionais para logging mais detalhado
logger.database = (message, data = {}) => {
  logger.info(message, { type: 'database', ...data });
};

logger.request = (message, data = {}) => {
  logger.info(message, { type: 'request', ...data });
};

logger.auth = (message, data = {}) => {
  logger.info(message, { type: 'auth', ...data });
};

// Capturar exceções não tratadas
process.on('uncaughtException', (error) => {
  logger.error('Exceção não tratada', { error: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rejeição não tratada', { reason: reason, promise: promise });
});

module.exports = logger;