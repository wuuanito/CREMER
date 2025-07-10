// File: hooks/manufacturingOrderHooks.js
const standardValue = 33.3;

module.exports = {
  beforeValidate: order => {
    // ───── ESTADO Y FECHAS ───────────────────────────────────────────────
    if (!order.createdAtOrder) {
      order.createdAtOrder = new Date();
    }
    if (order.state === 'iniciado' && !order.startAtOrder) {
      order.startAtOrder = new Date();
    }

    // ───── TIEMPOS BÁSICOS ────────────────────────────────────────────────
    order.estimatedProdTime = order.quantityToProduce / standardValue;

    // ───── CÁLCULOS DURANTE PRODUCCIÓN ────────────────────────────────────
    if (order.state === 'iniciado' || order.state === 'pausado' || order.state === 'finalizado') {
      // Calcular progreso basado en unidades producidas
      if (order.quantityToProduce > 0 && order.unitsPerBottle > 0) {
        const totalUnitsExpected = order.quantityToProduce * order.unitsPerBottle;
        order.progressPercent = totalUnitsExpected > 0 
          ? (order.totalUnits / totalUnitsExpected) * 100 
          : 0;
      }
    }

    // ───── CÁLCULOS AL FINALIZAR ──────────────────────────────────────────
    if (order.state === 'finalizado') {
      // Calcular tiempo activo restando las pausas del tiempo total
      order.totalActiveTime = (order.totalTime || 0) - (order.totalPauseTime || 0);

      const totalUnits = order.quantityToProduce * order.unitsPerBottle;

      // ───── CÁLCULOS DE RECIRCULACIÓN ──────────────────────────────────
      order.unitsRecircPonderal = (order.bottlesPonderal || 0) - (order.totalUnits || 0);
      order.unitsRecircRepercap = (order.bottlesRepercap || 0) - (order.totalUnits || 0);

      // ───── ESTÁNDARES Y DIFERENCIAS ────────────────────────────────────
      order.actualStandard = totalUnits > 0
        ? order.totalTime / totalUnits
        : 0;
      order.differenceVsTheoretical = totalUnits > 0
        ? ((order.actualStandard - standardValue) / standardValue) * 100
        : 0;

      // ───── MÉTRICAS DE RENDIMIENTO ────────────────────────────────────
      order.availability = order.totalTime > 0
        ? order.totalActiveTime / order.totalTime
        : 0;
      order.performance = order.totalActiveTime > 0
        ? totalUnits / (order.totalActiveTime * standardValue)
        : 0;

      // ───── CALIDAD ────────────────────────────────────────────────────
      order.quality = totalUnits > 0 && order.unitsOk !== undefined
        ? order.unitsOk / totalUnits
        : 0;

      // ───── PORCENTAJES ────────────────────────────────────────────────
      order.percentOk = totalUnits > 0
        ? (order.unitsOk / totalUnits) * 100
        : 0;
      order.percentNotOk = 100 - order.percentOk;
      order.percentUnitsOk = order.unitsOk;
      order.percentUnitsNotOk = totalUnits - order.unitsOk;
      order.percentPauses = order.totalTime > 0
        ? (order.totalPauseTime / order.totalTime) * 100
        : 0;

      // ───── OEE ────────────────────────────────────────────────────────
      order.oee = order.quality * order.performance * order.availability;
    }
  }
};
