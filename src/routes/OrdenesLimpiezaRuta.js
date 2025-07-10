const express = require('express');
const router = express.Router();

const crearOrdenLimpiezaApi = require('../api/CrearOrdenLimpiezaApi');
const iniciarOrdenLimpiezaApi = require('../api/IniciarOrdenLimpiezaApi');
const finalizarOrdenLimpiezaApi = require('../api/FinalizarOrdenLimpiezaApi');

// Crear orden de limpieza
router.post('/api/cleaning-orders', crearOrdenLimpiezaApi);

// Iniciar orden de limpieza
router.put('/api/cleaning-orders/:id/start', iniciarOrdenLimpiezaApi);

// Finalizar orden de limpieza
router.put('/api/cleaning-orders/:id/finish', finalizarOrdenLimpiezaApi);

module.exports = router;