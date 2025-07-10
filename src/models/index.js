// Importar los modelos ya inicializados desde la configuración de base de datos
const { ManufacturingOrder, Pause, CleaningOrder } = require('../config/database');

// Las relaciones ya están definidas en los modelos individuales a través del método associate
// No es necesario redefinirlas aquí

module.exports = {
  ManufacturingOrder,
  Pause,
  CleaningOrder
};