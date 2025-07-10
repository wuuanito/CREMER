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

    // Verificar que esté en estado 'creada'
    if (cleaningOrder.state !== 'creada') {
      return res.status(400).json({
        success: false,
        message: `No se puede iniciar la orden. Estado actual: ${cleaningOrder.state}`
      });
    }

    // Actualizar estado a 'iniciada'
    await cleaningOrder.update({
      state: 'iniciada'
    });

    logger.info(`Orden de limpieza iniciada: ID ${id}`);

    res.json({
      success: true,
      message: 'Orden de limpieza iniciada exitosamente',
      data: cleaningOrder
    });

  } catch (error) {
    logger.error('Error al iniciar orden de limpieza:', error);
    
    if (error.message.includes('Ya existe una orden de limpieza iniciada')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};