// File: hooks/manufacturingOrderHooks.js
const standardValue = 33.3; // botes por minuto

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
      // Calcular progreso basado en botes producidos
      if (order.quantityToProduce > 0) {
        order.progressPercent = order.quantityToProduce > 0 
          ? (order.totalUnits / order.quantityToProduce) * 100 
          : 0;
      }
    }

    // ───── CÁLCULOS AL FINALIZAR ──────────────────────────────────────────
    if (order.state === 'finalizado') {
      // Calcular tiempo activo restando las pausas del tiempo total
      order.totalActiveTime = (order.totalTime || 0) - (order.totalPauseTime || 0);

      // ───── CÁLCULOS DE RECIRCULACIÓN ──────────────────────────────────
      // Recirculación = botes que entraron - botes buenos - botes expulsados
      order.unitsRecircPonderal = (order.bottlesPonderal || 0) - (order.unitsOk || 0) - (order.expelledBottles || 0);
      order.unitsRecircRepercap = (order.bottlesRepercap || 0) - (order.unitsOk || 0);

      // ───── ESTÁNDARES Y DIFERENCIAS ────────────────────────────────────
      order.actualStandard = order.totalUnits > 0
        ? order.totalTime / order.totalUnits
        : 0;
      order.differenceVsTheoretical = order.totalUnits > 0
        ? ((order.actualStandard - (60/standardValue)) / (60/standardValue)) * 100
        : 0;

      // ───── MÉTRICAS DE RENDIMIENTO ────────────────────────────────────
      order.availability = order.totalTime > 0
        ? order.totalActiveTime / order.totalTime
        : 0;
      order.performance = order.totalActiveTime > 0
        ? order.totalUnits / (order.totalActiveTime * (standardValue / 60))
        : 0;

      // ───── CALIDAD ────────────────────────────────────────────────────
      order.quality = order.totalUnits > 0
        ? order.unitsOk / order.totalUnits
        : 0;

      // ───── PORCENTAJES ────────────────────────────────────────────────
      order.percentOk = order.totalUnits > 0
        ? (order.unitsOk / order.totalUnits) * 100
        : 0;
      order.percentNotOk = 100 - order.percentOk;
      order.percentUnitsOk = order.unitsOk;
      order.percentUnitsNotOk = order.totalUnits - order.unitsOk;
      order.percentPauses = order.totalTime > 0
        ? (order.totalPauseTime / order.totalTime) * 100
        : 0;

      // ───── TASAS DE EXPULSIÓN Y RECUPERACIÓN ──────────────────────────
      order.expulsionRate = order.bottlesPonderal > 0
        ? (order.expelledBottles / order.bottlesPonderal) * 100
        : 0;
      order.recoveryRateRepercap = order.bottlesRepercap > 0
        ? (order.unitsRecircRepercap / order.bottlesRepercap) * 100
        : 0;
      order.recoveryRatePonderal = order.bottlesPonderal > 0
        ? (order.unitsRecircPonderal / order.bottlesPonderal) * 100
        : 0;

      // ───── CÁLCULOS ADICIONALES ───────────────────────────────────────
      // Número de botes que pasan por repercap
      order.bottlesThroughRepercap = order.repercap 
        ? (order.unitsOk || 0) + (order.unitsRecircRepercap || 0)
        : 0;
      
      // Cajas contadas
      order.boxesCounted = order.unitsPerBottle > 0
        ? Math.floor(order.unitsOk / order.unitsPerBottle)
        : 0;

      // ───── OEE ────────────────────────────────────────────────────────
      order.oee = order.quality * order.performance * order.availability;
    }
  }
};
