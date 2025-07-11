// routes/ConsultarOrdenesRuta.js
const express = require('express');
const router = express.Router();
const { ManufacturingOrder, Pause } = require('../config/database');

/**
 * Obtiene todas las órdenes de fabricación
 */
router.get('/orders', async (req, res) => {
  try {
    const orders = await ManufacturingOrder.findAll({
      include: [{
        model: Pause,
        as: 'pauses'
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      message: 'Órdenes obtenidas exitosamente',
      orders: orders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Obtiene una orden específica por ID
 */
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await ManufacturingOrder.findByPk(id, {
      include: [{
        model: Pause,
        as: 'pauses'
      }]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    res.json({
      message: 'Orden obtenida exitosamente',
      order: order
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;