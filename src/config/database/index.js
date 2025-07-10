// src/config/database/index.js
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Variables de entorno
const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_NAME = 'manufacturing_db',
  DB_USER = 'root',
  DB_PASS = '',
  DB_DIALECT = 'mysql'
} = process.env;

// Inicializa Sequelize pasando explícitamente el dialect
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  logging: false
});

const db = { sequelize, Sequelize };

// Importa todos los modelos desde src/models (excluyendo index.js)
const modelsDir = path.join(__dirname, '../../models');
fs.readdirSync(modelsDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js')
  .forEach(file => {
    const model = require(path.join(modelsDir, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Asocia relaciones
Object.keys(db)
  .filter(key => db[key].associate)
  .forEach(key => db[key].associate(db));

// Sincroniza la base de datos al iniciar
sequelize.sync({ alter: true })
  .then(() => console.log('Database synchronized'))
  .catch(err => console.error('Sync error:', err));

module.exports = db;
