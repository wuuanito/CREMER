// routes/orders.js
const express = require('express');
const router = express.Router();
const { ManufacturingOrder } = require('../config/database');

const ALLOWED_FIELDS = [
  // Campos de identificación
  'orderCode',
  'articleCode',
  'batch',
  
  // Detalles de producción
  'quantityToProduce',
  'productDescription',
  
  // Embalaje
  'numberOfBoxes',
  'bottlesPerBox',
  'boxes'
];

router.post('/orders', async (req, res) => {
  const input = {};
  for (const key of ALLOWED_FIELDS) {
    if (req.body[key] !== undefined) {
      input[key] = req.body[key];
    }
  }

  try {
    const newOrder = await ManufacturingOrder.create(input);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
