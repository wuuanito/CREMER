// routes/DebugRuta.js
const express = require('express');
const router = express.Router();
const { ManufacturingOrder } = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * Debug endpoint para verificar el código actual del servidor
 */
router.get('/debug/insertar-datos-code', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'api', 'InsertarDatosOrdenApi.js');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    res.json({
      message: 'Código actual de InsertarDatosOrdenApi.js',
      fileContent: fileContent,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Debug endpoint para probar la lógica de inserción
 */
router.post('/debug/test-insert-logic', async (req, res) => {
  try {
    const { orderId, testData } = req.body;
    
    // Buscar la orden
    const order = await ManufacturingOrder.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    const ALLOWED_FIELDS_CREATED = [
      'format',
      'type',
      'unitsPerBottle',
      'bottleType'
    ];
    
    const ALLOWED_FIELDS_PRODUCTION = [
      'bottlesPonderal',
      'bottlesRepercap',
      'expelledBottles',
      'unitsOk',
      'unitsNotOk'
    ];
    
    // Determinar campos permitidos según el estado de la orden
    let allowedFields;
    let stateCheck = {
      currentState: order.state,
      isCreado: order.state === 'creado',
      isIniciado: order.state === 'iniciado'
    };
    
    if (order.state === 'creado') {
      allowedFields = ALLOWED_FIELDS_CREATED;
    } else if (order.state === 'iniciado') {
      allowedFields = ALLOWED_FIELDS_PRODUCTION;
    } else {
      return res.json({
        debug: true,
        stateCheck: stateCheck,
        error: `No se pueden insertar datos. La orden está en estado: ${order.state}`,
        allowedStates: ['creado', 'iniciado']
      });
    }
    
    // Filtrar solo los campos permitidos
    const updateData = {};
    for (const key of allowedFields) {
      if (testData[key] !== undefined) {
        updateData[key] = testData[key];
      }
    }
    
    res.json({
      debug: true,
      stateCheck: stateCheck,
      allowedFields: allowedFields,
      receivedData: testData,
      filteredData: updateData,
      wouldUpdate: Object.keys(updateData).length > 0
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;