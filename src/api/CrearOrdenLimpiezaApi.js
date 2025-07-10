const { CleaningOrder } = require('../models');
const logger = require('../config/logger');

module.exports = async (req, res) => {
  try {
    const { description } = req.body;

    // Validar datos requeridos
    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'La descripción es requerida'
      });
    }

    // Crear la orden de limpieza
    const cleaningOrder = await CleaningOrder.create({
      description: description.trim(),
      state: 'creada'
    });

    logger.info(`Orden de limpieza creada: ID ${cleaningOrder.id}`);

    res.status(201).json({
      success: true,
      message: 'Orden de limpieza creada exitosamente',
      data: cleaningOrder
    });

  } catch (error) {
    logger.error('Error al crear orden de limpieza:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};