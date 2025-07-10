// routes/PausarOrdenRuta.js
const express = require('express');
const router = express.Router();
const { ManufacturingOrder } = require('../config/database');

/**
 * Pausa una orden de fabricación en curso
 */
router.put('/orders/:id/pause', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la orden
    const order = await ManufacturingOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    // Verificar que la orden esté en estado 'iniciado'
    if (order.state !== 'iniciado') {
      return res.status(400).json({ 
        error: `No se puede pausar la orden. Estado actual: ${order.state}` 
      });
    }
    
    // Actualizar estado a 'pausado'
    await order.update({ state: 'pausado' });
    
    res.json({
      message: 'Orden pausada exitosamente',
      order: order
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;