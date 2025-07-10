// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('./src/config/database');
const Logger = require('./src/config/logger');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Inicializar MQTT
const botesPonderalMqtt = require('./src/api/BotesPonderalMqttApi');
const botesExpulsadosMqtt = require('./src/api/BotesExpulsadosMqttApi');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Cargar rutas automáticamente
const routesDir = path.join(__dirname, 'src/routes');
fs.readdirSync(routesDir)
  .filter(file => file.endsWith('Ruta.js'))
  .forEach(file => {
    const route = require(path.join(routesDir, file));
    app.use('/api', route);
  });

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    Logger.app.dbConnect();
    
    // Inicializar conexiones MQTT
    botesPonderalMqtt.connect();
    botesExpulsadosMqtt.connect();
    
    Logger.app.start(PORT);
  } catch (error) {
    Logger.app.dbError(error);
  }
});

// Manejar cierre de aplicación
process.on('SIGINT', () => {
  Logger.app.shutdown();
  botesPonderalMqtt.disconnect();
  botesExpulsadosMqtt.disconnect();
  process.exit(0);
});
