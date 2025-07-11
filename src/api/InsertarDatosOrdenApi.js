// api/InsertarDatosOrdenApi.js
const express = require('express');
const router = express.Router();
const { ManufacturingOrder } = require('../config/database');

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

router.put('/orders/:id/data', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la orden
    const order = await ManufacturingOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    // Determinar campos permitidos según el estado de la orden
    let allowedFields;
    if (order.state === 'creado') {
      allowedFields = ALLOWED_FIELDS_CREATED;
    } else if (order.state === 'iniciado') {
      allowedFields = ALLOWED_FIELDS_PRODUCTION;
    } else {
      return res.status(400).json({ 
        error: `No se pueden insertar datos. La orden está en estado: ${order.state}` 
      });
    }
    
    // Filtrar solo los campos permitidos
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }
    
    // Verificar que se envíen datos para actualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        error: 'No se proporcionaron datos válidos para actualizar' 
      });
    }
    
    // Actualizar la orden
    await order.update(updateData);
    
    res.json({
      message: 'Datos insertados exitosamente',
      order: order,
      updatedFields: Object.keys(updateData)
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;