// api/TestDataApi.js
const express = require('express');
const router = express.Router();
const { ManufacturingOrder, Pause } = require('../config/database');
const logger = require('../config/logger');

router.put('/orders/:id/test-data', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      // Datos básicos
      startAtOrder,
      state,
      
      // Datos de producción manual
      format,
      type,
      bottleType,
      unitsPerBottle,
      
      // Contadores manuales para testing
      bottlesPonderal,
      bottlesRepercap,
      expelledBottles,
      unitsOk,
      unitsNotOk,
      totalUnits,
      
      // Configuración
      repercap,
      
      // Pausas para testing (array de pausas)
      testPauses
    } = req.body;
    
    logger.info(`Insertando datos de testing para orden ${id}`);
    
    // Buscar la orden
    const order = await ManufacturingOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    // Preparar datos para actualizar
    const updateData = {};
    
    // Datos básicos
    if (startAtOrder) updateData.startAtOrder = new Date(startAtOrder);
    if (state) updateData.state = state;
    
    // Datos de producción
    if (format) updateData.format = format;
    if (type) updateData.type = type;
    if (bottleType) updateData.bottleType = bottleType;
    if (unitsPerBottle !== undefined) updateData.unitsPerBottle = unitsPerBottle;
    
    // Contadores
    if (bottlesPonderal !== undefined) updateData.bottlesPonderal = bottlesPonderal;
    if (bottlesRepercap !== undefined) updateData.bottlesRepercap = bottlesRepercap;
    if (expelledBottles !== undefined) updateData.expelledBottles = expelledBottles;
    if (unitsOk !== undefined) updateData.unitsOk = unitsOk;
    if (unitsNotOk !== undefined) updateData.unitsNotOk = unitsNotOk;
    if (totalUnits !== undefined) updateData.totalUnits = totalUnits;
    
    // Configuración
    if (repercap !== undefined) updateData.repercap = repercap;
    
    // Calcular campos automáticos si tenemos datos suficientes
    if (updateData.totalUnits && updateData.totalUnits > 0) {
      updateData.progressPercent = Math.min(
        (updateData.totalUnits / order.quantityToProduce) * 100, 
        100
      );
    }
    
    // Actualizar la orden
    await order.update(updateData);
    
    // Crear pausas de testing si se proporcionan
    if (testPauses && Array.isArray(testPauses)) {
      for (const pause of testPauses) {
        await Pause.create({
          orderId: id,
          pauseType: pause.motivo || 'Test',
          comments: pause.descripcion || 'Pausa de testing',
          startPause: new Date(pause.startPause),
          endPause: new Date(pause.endPause),
          duration: pause.duration || Math.round(
            (new Date(pause.endPause) - new Date(pause.startPause)) / (1000 * 60)
          )
        });
      }
    }
    
    // Recargar la orden con todos los datos actualizados
    const updatedOrder = await ManufacturingOrder.findByPk(id, {
      include: [{
        model: require('../config/database').Pause,
        as: 'pauses'
      }]
    });
    
    logger.info(`Datos de testing insertados exitosamente para orden ${id}`);
    
    res.json({
      message: 'Datos de testing insertados exitosamente',
      order: updatedOrder,
      note: 'Los cálculos finales se ejecutarán cuando cambies el estado a "finalizado"'
    });
    
  } catch (err) {
    logger.error(`Error insertando datos de testing: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint adicional para simular finalización con cálculos
router.put('/orders/:id/test-finish', async (req, res) => {
  try {
    const { id } = req.params;
    const { endTime } = req.body; // Hora de finalización manual
    
    const order = await ManufacturingOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    // Actualizar estado a finalizado
    await order.update({ 
      state: 'finalizado'
      // Los hooks se encargarán de los cálculos automáticos
    });
    
    // Si se proporciona hora de fin manual, simular tiempo transcurrido
    if (endTime && order.startAtOrder) {
      const totalMinutes = Math.round(
        (new Date(endTime) - new Date(order.startAtOrder)) / (1000 * 60)
      );
      
      await order.update({
        totalTime: totalMinutes
      });
    }
    
    // Recargar con cálculos actualizados
    const finalOrder = await ManufacturingOrder.findByPk(id, {
      include: [{
        model: require('../config/database').Pause,
        as: 'pauses'
      }]
    });
    
    res.json({
      message: 'Orden finalizada con datos de testing',
      order: finalOrder
    });
    
  } catch (err) {
    logger.error(`Error finalizando orden de testing: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;