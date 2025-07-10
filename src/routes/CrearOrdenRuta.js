const express = require('express');
const router = express.Router();
const { ManufacturingOrder } = require('../config/database');

/**
 * Crea una nueva orden de fabricación
 */
router.post('/orders', async (req, res) => {
  try {
    const newOrder = await ManufacturingOrder.create(req.body);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;