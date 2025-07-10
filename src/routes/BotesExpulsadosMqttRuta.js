// routes/BotesExpulsadosMqttRuta.js
const express = require('express');
const router = express.Router();
const botesExpulsadosMqtt = require('../api/BotesExpulsadosMqttApi');

/**
 * Obtiene el estado de la conexión MQTT para botes expulsados
 */
router.get('/mqtt/expulsados/status', (req, res) => {
  try {
    const status = botesExpulsadosMqtt.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Conecta al broker MQTT para botes expulsados
 */
router.post('/mqtt/expulsados/connect', (req, res) => {
  try {
    botesExpulsadosMqtt.connect();
    res.json({ message: 'Conectando al broker MQTT para botes expulsados...' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Desconecta del broker MQTT para botes expulsados
 */
router.post('/mqtt/expulsados/disconnect', (req, res) => {
  try {
    botesExpulsadosMqtt.disconnect();
    res.json({ message: 'Desconectado del broker MQTT para botes expulsados' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;