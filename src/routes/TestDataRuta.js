// routes/TestDataRuta.js
const express = require('express');
const router = express.Router();
const { ManufacturingOrder, Pause } = require('../config/database');
const logger = require('../config/logger');

// Endpoint para insertar datos de testing
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
        model: Pause,
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
    const { endTime } = req.body;
    
    const order = await ManufacturingOrder.findByPk(id, {
      include: [{
        model: Pause,
        as: 'pauses'
      }]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    // Calcular tiempos
    let totalActiveTime = 0;
    let totalPauseTime = 0;
    let totalTime = 0;
    
    if (order.startAtOrder) {
      const startTime = new Date(order.startAtOrder);
      const finishTime = endTime ? new Date(endTime) : new Date();
      totalTime = Math.round((finishTime - startTime) / (1000 * 60));
      
      if (order.pauses && order.pauses.length > 0) {
        totalPauseTime = order.pauses.reduce((sum, pause) => {
          return sum + (pause.duration || 0);
        }, 0);
      }
      
      totalActiveTime = totalTime - totalPauseTime;
    }
    
    // CALCULAR MANUALMENTE LOS VALORES (como en los hooks)
    const standardValue = 33.3;
    const totalUnitsExpected = order.quantityToProduce * order.unitsPerBottle;
    
    // Métricas de rendimiento
    const availability = totalTime > 0 ? totalActiveTime / totalTime : 0;
    const performance = totalActiveTime > 0 ? totalUnitsExpected / (totalActiveTime * standardValue) : 0;
    
    // Calidad
    const quality = totalUnitsExpected > 0 && order.unitsOk !== undefined ? order.unitsOk / totalUnitsExpected : 0;
    
    // Porcentajes
    const percentOk = totalUnitsExpected > 0 ? (order.unitsOk / totalUnitsExpected) * 100 : 0;
    const percentNotOk = 100 - percentOk;
    const percentPauses = totalTime > 0 ? (totalPauseTime / totalTime) * 100 : 0;
    
    // OEE
    const oee = quality * performance * availability;
    
    // Estándares
    const actualStandard = totalUnitsExpected > 0 ? totalTime / totalUnitsExpected : 0;
    const differenceVsTheoretical = totalUnitsExpected > 0 ? ((actualStandard - standardValue) / standardValue) * 100 : 0;
    
    // Actualizar con todos los cálculos
    await order.update({ 
      state: 'finalizado',
      totalActiveTime: totalActiveTime,
      totalPauseTime: totalPauseTime,
      totalTime: totalTime,
      // Cálculos manuales
      availability: availability,
      performance: performance,
      quality: quality,
      percentOk: percentOk,
      percentNotOk: percentNotOk,
      percentUnitsOk: order.unitsOk,
      percentUnitsNotOk: totalUnitsExpected - order.unitsOk,
      percentPauses: percentPauses,
      oee: oee,
      standard: standardValue,
      actualStandard: actualStandard,
      differenceVsTheoretical: differenceVsTheoretical
    });
    
    // Recargar con cálculos actualizados
    const finalOrder = await ManufacturingOrder.findByPk(id, {
      include: [{
        model: Pause,
        as: 'pauses'
      }]
    });
    
    res.json({
      message: 'Orden finalizada con datos de testing y cálculos completos',
      order: finalOrder,
      calculatedMetrics: {
        availability: availability,
        performance: performance,
        quality: quality,
        oee: oee,
        percentOk: percentOk
      }
    });
    
  } catch (err) {
    logger.error(`Error finalizando orden de testing: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;