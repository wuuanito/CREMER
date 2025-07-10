// routes/BotesPonderalMqttRuta.js
const express = require('express');
const router = express.Router();
const botesPonderalMqtt = require('../api/BotesPonderalMqttApi');

/**
 * Obtiene el estado de la conexión MQTT
 */
router.get('/mqtt/status', (req, res) => {
  try {
    const status = botesPonderalMqtt.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Conecta al broker MQTT
 */
router.post('/mqtt/connect', (req, res) => {
  try {
    botesPonderalMqtt.connect();
    res.json({ message: 'Conectando al broker MQTT...' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Desconecta del broker MQTT
 */
router.post('/mqtt/disconnect', (req, res) => {
  try {
    botesPonderalMqtt.disconnect();
    res.json({ message: 'Desconectado del broker MQTT' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;