// api/FinalizarOrdenApi.js
const express = require('express');
const router = express.Router();
const { ManufacturingOrder } = require('../config/database');

router.put('/orders/:id/finish', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la orden
    const order = await ManufacturingOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    // Verificar que la orden esté en estado 'iniciado' o 'pausado'
    if (order.state !== 'iniciado' && order.state !== 'pausado') {
      return res.status(400).json({ 
        error: `No se puede finalizar la orden. Estado actual: ${order.state}` 
      });
    }
    
    // Actualizar estado a 'finalizado' y establecer fecha de finalización
    await order.update({ 
      state: 'finalizado',
      finishedAtOrder: new Date()
    });
    
    res.json({
      message: 'Orden finalizada exitosamente',
      order: order
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;