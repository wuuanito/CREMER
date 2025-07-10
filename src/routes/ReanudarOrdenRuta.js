// routes/ReanudarOrdenRuta.js
const express = require('express');
const router = express.Router();
const { ManufacturingOrder } = require('../config/database');

/**
 * Reanuda una orden de fabricación pausada
 */
router.put('/orders/:id/resume', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la orden
    const order = await ManufacturingOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    // Verificar que la orden esté en estado 'pausado'
    if (order.state !== 'pausado') {
      return res.status(400).json({ 
        error: `No se puede reanudar la orden. Estado actual: ${order.state}` 
      });
    }
    
    // Actualizar estado a 'iniciado'
    await order.update({ state: 'iniciado' });
    
    res.json({
      message: 'Orden reanudada exitosamente',
      order: order
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;