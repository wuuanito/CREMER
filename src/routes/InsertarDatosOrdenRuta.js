// routes/InsertarDatosOrdenRuta.js
const express = require('express');
const router = express.Router();
const { ManufacturingOrder } = require('../config/database');

const ALLOWED_FIELDS = [
  'format',
  'type',
  'unitsPerBottle',
  'bottleType'
];

/**
 * Inserta datos adicionales en una orden de fabricación
 */
router.put('/orders/:id/data', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la orden
    const order = await ManufacturingOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    // Verificar que la orden esté en estado 'creado'
    if (order.state !== 'creado') {
      return res.status(400).json({ 
        error: `No se pueden insertar datos. La orden ya está en estado: ${order.state}` 
      });
    }
    
    // Filtrar solo los campos permitidos
    const updateData = {};
    for (const key of ALLOWED_FIELDS) {
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