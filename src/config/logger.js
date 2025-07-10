// config/logger.js
const winston = require('winston');
const path = require('path');

// Configuración de formatos
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

// Configuración de transportes
const transports = [
  // Archivo para errores
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  
  // Archivo para todos los logs
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
];

// En desarrollo, también mostrar en consola
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

// Crear el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  // No salir en errores no capturados
  exitOnError: false
});

// Wrapper para diferentes tipos de logs
const Logger = {
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  info: (message, meta = {}) => logger.info(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),
  
  // Logs específicos para MQTT
  mqtt: {
    connect: (broker, topic) => logger.info(`MQTT conectado a ${broker}, topic: ${topic}`),
    disconnect: (broker) => logger.info(`MQTT desconectado de ${broker}`),
    message: (topic, message) => logger.debug(`MQTT mensaje en ${topic}: ${message}`),
    error: (error) => logger.error(`MQTT error: ${error.message}`, { error })
  },
  
  // Logs específicos para órdenes
  order: {
    created: (orderCode) => logger.info(`Orden creada: ${orderCode}`),
    started: (orderCode) => logger.info(`Orden iniciada: ${orderCode}`),
    paused: (orderCode) => logger.info(`Orden pausada: ${orderCode}`),
    resumed: (orderCode) => logger.info(`Orden reanudada: ${orderCode}`),
    finished: (orderCode) => logger.info(`Orden finalizada: ${orderCode}`),
    updated: (orderCode, field, value) => logger.debug(`Orden ${orderCode} - ${field}: ${value}`),
    notFound: (id) => logger.warn(`Orden no encontrada: ${id}`),
    error: (orderCode, error) => logger.error(`Error en orden ${orderCode}: ${error.message}`, { error })
  },
  
  // Logs específicos para la aplicación
  app: {
    start: (port) => logger.info(`Servidor iniciado en puerto ${port}`),
    dbConnect: () => logger.info('Conexión a base de datos establecida'),
    dbError: (error) => logger.error(`Error de base de datos: ${error.message}`, { error }),
    shutdown: () => logger.info('Aplicación cerrándose...')
  }
};

module.exports = Logger;