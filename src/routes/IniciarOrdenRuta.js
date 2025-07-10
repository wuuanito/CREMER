// routes/IniciarOrdenRuta.js
const express = require('express');
const router = express.Router();
const { ManufacturingOrder } = require('../config/database');

/**
 * Inicia una orden de fabricación
 */
router.put('/orders/:id/start', async (req, res) => {
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
        error: `No se puede iniciar la orden. Estado actual: ${order.state}` 
      });
    }
    
    // Actualizar estado a 'iniciado'
    await order.update({ state: 'iniciado' });
    
    res.json({
      message: 'Orden iniciada exitosamente',
      order: order
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;