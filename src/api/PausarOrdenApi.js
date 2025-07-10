// api/PausarOrdenApi.js
const express = require('express');
const router = express.Router();
const { ManufacturingOrder, Pause } = require('../config/database');

router.put('/orders/:id/pause', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo, descripcion } = req.body; // Nuevos campos requeridos
    
    // Validar que se proporcionen motivo y descripción
    if (!motivo) {
      return res.status(400).json({ error: 'El motivo de la pausa es requerido' });
    }
    
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
    
    // Crear registro de pausa
    const pauseRecord = await Pause.create({
      orderId: id,
      pauseType: motivo,
      comments: descripcion || null,
      startPause: new Date(),
      endPause: new Date(), // Se actualizará cuando se reanude
      duration: 0 // Se calculará cuando se reanude
    });
    
    // Actualizar estado a 'pausado'
    await order.update({ 
      state: 'pausado'
    });
    
    res.json({
      message: 'Orden pausada exitosamente',
      order: order,
      pause: pauseRecord
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;