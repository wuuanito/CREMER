// api/ReanudarOrdenApi.js
const express = require('express');
const router = express.Router();
const { ManufacturingOrder, Pause } = require('../config/database');

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
    
    // Buscar la pausa activa (la más reciente sin duración calculada)
    const activePause = await Pause.findOne({
      where: { 
        orderId: id,
        duration: 0 
      },
      order: [['startPause', 'DESC']]
    });
    
    if (activePause) {
      const endTime = new Date();
      const duration = Math.round((endTime - activePause.startPause) / (1000 * 60)); // minutos
      
      await activePause.update({
        endPause: endTime,
        duration: duration
      });
    }
    
    // Actualizar estado a 'iniciado'
    await order.update({ 
      state: 'iniciado'
    });
    
    res.json({
      message: 'Orden reanudada exitosamente',
      order: order,
      pauseDuration: activePause ? activePause.duration : 0
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;