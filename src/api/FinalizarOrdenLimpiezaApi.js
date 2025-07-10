const { CleaningOrder } = require('../models');
const logger = require('../config/logger');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar la orden de limpieza
    const cleaningOrder = await CleaningOrder.findByPk(id);
    
    if (!cleaningOrder) {
      return res.status(404).json({
        success: false,
        message: 'Orden de limpieza no encontrada'
      });
    }

    // Verificar que esté en estado 'iniciada'
    if (cleaningOrder.state !== 'iniciada') {
      return res.status(400).json({
        success: false,
        message: `No se puede finalizar la orden. Estado actual: ${cleaningOrder.state}`
      });
    }

    // Actualizar estado a 'finalizada'
    await cleaningOrder.update({
      state: 'finalizada'
    });

    logger.info(`Orden de limpieza finalizada: ID ${id}, Duración: ${cleaningOrder.duration} minutos`);

    res.json({
      success: true,
      message: 'Orden de limpieza finalizada exitosamente',
      data: cleaningOrder
    });

  } catch (error) {
    logger.error('Error al finalizar orden de limpieza:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};