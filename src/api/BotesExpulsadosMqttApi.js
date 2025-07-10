// api/BotesExpulsadosMqttApi.js
const mqtt = require('mqtt');
const { ManufacturingOrder } = require('../config/database');
const Logger = require('../config/logger');

const MQTT_CONFIG = {
  host: '192.168.20.156',
  port: 1883,
  username: 'administrador',
  password: 'root',
  protocolVersion: 4,
  topic: 'botes/expulsados'
};

class BotesExpulsadosMqtt {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  connect() {
    const brokerUrl = `mqtt://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}`;
    
    this.client = mqtt.connect(brokerUrl, {
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      protocolVersion: MQTT_CONFIG.protocolVersion
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      Logger.mqtt.connect(brokerUrl, MQTT_CONFIG.topic);
      
      this.client.subscribe(MQTT_CONFIG.topic, (err) => {
        if (err) {
          Logger.mqtt.error(err);
        }
      });
    });

    this.client.on('message', async (topic, message) => {
      if (topic === MQTT_CONFIG.topic) {
        await this.handleBotesExpulsados(message.toString());
      }
    });

    this.client.on('error', (err) => {
      Logger.mqtt.error(err);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      Logger.mqtt.disconnect(`${MQTT_CONFIG.host}:${MQTT_CONFIG.port}`);
      this.isConnected = false;
    });
  }

  async handleBotesExpulsados(message) {
    try {
      Logger.mqtt.message(MQTT_CONFIG.topic, message);
      
      const activeOrder = await ManufacturingOrder.findOne({
        where: { state: 'iniciado' },
        order: [['startAtOrder', 'DESC']]
      });

      if (!activeOrder) {
        Logger.warn('No hay órdenes activas para actualizar botes expulsados');
        return;
      }

      const currentExpelledBottles = activeOrder.expelledBottles || 0;
      
      await activeOrder.update({
        expelledBottles: currentExpelledBottles + 1
      });

      Logger.order.updated(activeOrder.orderCode, 'expelledBottles', currentExpelledBottles + 1);
      
    } catch (error) {
      Logger.error('Error procesando bote expulsado', { error, message });
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      broker: `${MQTT_CONFIG.host}:${MQTT_CONFIG.port}`,
      topic: MQTT_CONFIG.topic
    };
  }
}

const botesExpulsadosMqtt = new BotesExpulsadosMqtt();
module.exports = botesExpulsadosMqtt;