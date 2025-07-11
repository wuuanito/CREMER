// hooks/manufacturingOrderHooks.js
const { Pause } = require('../config/database');

const calculateFields = async (order) => {
  // Calcular totalUnits automáticamente
  const totalUnits = (order.unitsOk || 0) + (order.unitsNotOk || 0);
  order.totalUnits = totalUnits;
  
  // Calcular tiempos automáticamente
  let totalTime = 0;
  let totalPauseTime = 0;
  let totalActiveTime = 0;
  
  // Si la orden tiene fecha de inicio, calcular tiempos
  if (order.startAtOrder) {
    const startTime = new Date(order.startAtOrder);
    const endTime = order.finishedAtOrder ? new Date(order.finishedAtOrder) : new Date();
    
    // Calcular tiempo total en minutos
    totalTime = Math.round((endTime - startTime) / (1000 * 60));
    
    // Obtener todas las pausas de esta orden y sumar sus duraciones
    try {
      const pauses = await Pause.findAll({
        where: { orderId: order.id },
        attributes: ['duration']
      });
      
      totalPauseTime = pauses.reduce((sum, pause) => sum + (pause.duration || 0), 0);
    } catch (error) {
      console.log('Error calculando pausas:', error);
      totalPauseTime = 0;
    }
    
    // Calcular tiempo activo
    totalActiveTime = totalTime - totalPauseTime;
  }
  
  // Calcular tiempo estimado de producción (en minutos)
  const estimatedProdTime = Math.round(order.quantityToProduce / 33.3);
  
  // Calcular porcentaje de progreso
  const progressPercent = order.quantityToProduce > 0 
    ? Math.round((totalUnits / order.quantityToProduce) * 100)
    : 0;
  
  // Calcular unidades recirculadas ponderal
  const unitsRecircPonderal = order.bottlesPonderal * order.unitsPerBottle;
  
  // Calcular unidades recirculadas repercap
  const unitsRecircRepercap = order.bottlesRepercap * order.unitsPerBottle;
  
  // Calcular estándar actual
  const actualStandard = totalActiveTime > 0 
    ? Math.round(totalUnits / totalActiveTime)
    : 0;
  
  // Calcular diferencia vs teórico
  const differenceVsTheoretical = actualStandard - 33.3;
  
  // Calcular disponibilidad
  const availability = totalTime > 0 
    ? Math.round((totalActiveTime / totalTime) * 100) / 100
    : 0;
  
  // Calcular rendimiento
  const performance = totalActiveTime > 0 
    ? Math.round((totalUnits / (totalActiveTime * 33.3)) * 100) / 100
    : 0;
  
  // Calcular calidad
  const quality = totalUnits > 0 
    ? Math.round((order.unitsOk / totalUnits) * 100) / 100
    : 0;
  
  // Calcular porcentajes
  const percentOk = totalUnits > 0 
    ? Math.round((order.unitsOk / totalUnits) * 100)
    : 0;
  
  const percentNotOk = totalUnits > 0 
    ? Math.round((order.unitsNotOk / totalUnits) * 100)
    : 0;
  
  const percentUnitsOk = order.quantityToProduce > 0 
    ? Math.round((order.unitsOk / order.quantityToProduce) * 100)
    : 0;
  
  const percentUnitsNotOk = order.quantityToProduce > 0 
    ? Math.round((order.unitsNotOk / order.quantityToProduce) * 100)
    : 0;
  
  const percentPauses = totalTime > 0 
    ? Math.round((totalPauseTime / totalTime) * 100)
    : 0;
  
  // Calcular OEE
  const oee = Math.round((availability * performance * quality) * 100) / 100;
  
  // Calcular tasa de expulsión
  const expulsionRate = order.bottlesPonderal > 0 
    ? Math.round((order.expelledBottles / order.bottlesPonderal) * 100) / 100
    : 0;
  
  // Calcular tasa de recuperación repercap
  const recoveryRateRepercap = order.bottlesPonderal > 0 
    ? Math.round((order.bottlesRepercap / order.bottlesPonderal) * 100) / 100
    : 0;
  
  // Calcular tasa de recuperación ponderal
  const recoveryRatePonderal = order.quantityToProduce > 0 
    ? Math.round((unitsRecircPonderal / order.quantityToProduce) * 100) / 100
    : 0;
  
  // Calcular botellas que pasan por repercap
  const bottlesThroughRepercap = order.bottlesPonderal - order.expelledBottles;
  
  // Calcular cajas contadas
  const boxesCounted = order.bottlesPerBox > 0 
    ? Math.round(totalUnits / order.bottlesPerBox)
    : 0;
  
  return {
    totalUnits,
    estimatedProdTime,
    progressPercent,
    totalTime,
    totalPauseTime,
    totalActiveTime,
    unitsRecircPonderal,
    unitsRecircRepercap,
    actualStandard,
    differenceVsTheoretical,
    availability,
    performance,
    quality,
    percentOk,
    percentNotOk,
    percentUnitsOk,
    percentUnitsNotOk,
    percentPauses,
    oee,
    expulsionRate,
    recoveryRateRepercap,
    recoveryRatePonderal,
    bottlesThroughRepercap,
    boxesCounted
  };
};

const beforeCreate = async (order) => {
  // Validación: Solo una orden de fabricación puede estar iniciada
  if (order.state === 'iniciado') {
    const { ManufacturingOrder } = require('../config/database');
    const activeManufacturingOrder = await ManufacturingOrder.findOne({
      where: { state: 'iniciado' }
    });
    
    if (activeManufacturingOrder) {
      throw new Error('Ya existe una orden de fabricación iniciada. Debe finalizar la orden actual antes de iniciar una nueva.');
    }
  }
  
  // Establecer fecha de creación
  if (!order.createdAtOrder) {
    order.createdAtOrder = new Date();
  }
  
  // Establecer fecha de inicio si el estado es 'iniciado'
  if (order.state === 'iniciado' && !order.startAtOrder) {
    order.startAtOrder = new Date();
  }
  
  // Calcular campos
  const calculated = await calculateFields(order);
  Object.assign(order, calculated);
};

const beforeUpdate = async (order) => {
  // Validación: Solo una orden de fabricación puede estar iniciada
  if (order.state === 'iniciado') {
    const { ManufacturingOrder } = require('../config/database');
    const { Op } = require('sequelize');
    const activeManufacturingOrder = await ManufacturingOrder.findOne({
      where: { 
        state: 'iniciado',
        id: { [Op.ne]: order.id }
      }
    });
    
    if (activeManufacturingOrder) {
      throw new Error('Ya existe una orden de fabricación iniciada. Debe finalizar la orden actual antes de iniciar una nueva.');
    }
  }
  
  // Establecer fecha de inicio si el estado cambia a 'iniciado'
  if (order.state === 'iniciado' && !order.startAtOrder) {
    order.startAtOrder = new Date();
  }
  
  const calculated = await calculateFields(order);
  Object.assign(order, calculated);
};

const afterUpdate = async (order) => {
  // Recalcular después de actualizar para asegurar que los tiempos estén correctos
  if (order.changed('finishedAtOrder') || order.changed('startAtOrder')) {
    const calculated = await calculateFields(order);
    await order.update(calculated, { hooks: false });
  }
};

module.exports = {
  beforeCreate,
  beforeUpdate,
  afterUpdate
};
