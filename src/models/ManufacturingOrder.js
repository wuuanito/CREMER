// models/ManufacturingOrder.js
module.exports = (sequelize, DataTypes) => {
  const ManufacturingOrder = sequelize.define('ManufacturingOrder', {
    // ───── IDENTIFICACIÓN ─────────────────────────────────────────────────────
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Código de orden de fabricación'
    },
    articleCode: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Código de artículo'
    },
     state: {
      type: DataTypes.ENUM('creado','iniciado','pausado','finalizado'),
      allowNull: false,
      defaultValue: 'creado',
      comment: 'Estado de la orden'
    },
    batch: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Lote'
    },

    // ───── TIEMPOS ─────────────────────────────────────────────────────────────
    createdAtOrder: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Hora de creación de la orden'
    },
    startAtOrder: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Hora de inicio de la orden'
    },
    estimatedProdTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Tiempo estimado producción (minutos)'
    },

    // ───── DETALLES DE PRODUCCIÓN ──────────────────────────────────────────────
    quantityToProduce: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Cantidad a producir'
    },
    productDescription: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Descripción del producto'
    },
    format: {
      type: DataTypes.STRING,
      allowNull: true, // Cambiado de false a true
      comment: 'Formato'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true, // Cambiado de false a true
      comment: 'Tipo'
    },

    // ───── EMBALAJE ────────────────────────────────────────────────────────────
    numberOfBoxes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número de cajas'
    },
    bottlesPerBox: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Botes por caja'
    },
    bottleType: {
      type: DataTypes.STRING,
      allowNull: true, // Cambiado de false a true
      comment: 'Tipo de bote'
    },
    boxes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Cajas'
    },
    unitsPerBottle: {
      type: DataTypes.INTEGER,
      allowNull: true, // Cambiado de false a true
      comment: 'Unidades/bote'
    },

    // ───── RECIRCULACIÓN ───────────────────────────────────────────────────────
    bottlesPonderal: {
      type: DataTypes.INTEGER,
      allowNull: true, // Cambiado de false a true
      defaultValue: 0, // Agregado valor por defecto
      comment: 'Botes ponderal'
    },
    bottlesRepercap: {
      type: DataTypes.INTEGER,
      allowNull: true, // Cambiado de false a true
      defaultValue: 0, // Agregado valor por defecto
      comment: 'Botes repercap'
    },
    repercap: {
      type: DataTypes.BOOLEAN,
      allowNull: true, // Cambiado de false a true
      defaultValue: false, // Agregado valor por defecto
      comment: 'Repercap (sí/no)'
    },
    unitsRecircPonderal: {
      type: DataTypes.INTEGER,
      allowNull: true, // Cambiado de false a true
      defaultValue: 0, // Agregado valor por defecto
      comment: 'Unidades recirculación ponderal'
    },
    unitsRecircRepercap: {
      type: DataTypes.INTEGER,
      allowNull: true, // Cambiado de false a true
      defaultValue: 0, // Agregado valor por defecto
      comment: 'Unidades recirculación repercap'
    },
    expelledBottles: {
      type: DataTypes.INTEGER,
      allowNull: true, // Cambiado de false a true
      defaultValue: 0, // Agregado valor por defecto
      comment: 'Botes expulsados'
    },

    // ───── MÉTRICAS DE RENDIMIENTO ────────────────────────────────────────────
    availability: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Disponibilidad (calculado al finalizar)'
    },
    performance: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Rendimiento (calculado al finalizar)'
    },

    // ───── CALIDAD ────────────────────────────────────────────────────────────
    quality: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Calidad (calculado al finalizar)'
    },
    percentOk: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: '% OK (calculado al finalizar)'
    },
    percentNotOk: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: '% No OK (calculado al finalizar)'
    },
    percentUnitsOk: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: '% unidades OK (calculado al finalizar)'
    },
    percentUnitsNotOk: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: '% unidades no OK (calculado al finalizar)'
    },
    unitsOk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Unidades OK (se actualiza durante producción)'
    },
    unitsNotOk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Unidades no OK (se actualiza durante producción)'
    },
    totalUnits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total unidades (se actualiza durante producción)'
    },

    // ───── PROGRESO & OEE ─────────────────────────────────────────────────────
    progressPercent: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      comment: '% progreso (se actualiza durante producción)'
    },
    oee: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'OEE (calculado al finalizar)'
    },
    percentPauses: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: '% pausas (calculado al finalizar)'
    },

    // ───── TIEMPOS TOTALES ────────────────────────────────────────────────────
    totalActiveTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Total tiempo activo (minutos) - calculado al finalizar'
    },
    totalPauseTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Total tiempo pausas (minutos) - calculado al finalizar'
    },
    totalTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Total tiempo (minutos) - calculado al finalizar'
    },

    // ───── ESTÁNDARES & DIFERENCIAS ───────────────────────────────────────────
    standard: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Estándar (valor de referencia por orden) - calculado al finalizar'
    },
    actualStandard: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Estándar real - calculado al finalizar'
    },
    differenceVsTheoretical: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Diferencia vs teórico - calculado al finalizar'
    }
  }, {
    tableName: 'manufacturing_orders',
    timestamps: false,
    hooks: {
      beforeValidate: require('../hooks/manufacturingOrderHooks').beforeValidate
    }
  });

  // Validación: Solo una orden de fabricación puede estar iniciada
  ManufacturingOrder.addHook('beforeCreate', async (order) => {
    if (order.state === 'iniciado') {
      const activeManufacturingOrder = await ManufacturingOrder.findOne({
        where: { state: 'iniciado' }
      });
      
      if (activeManufacturingOrder) {
        throw new Error('Ya existe una orden de fabricación iniciada. Debe finalizar la orden actual antes de iniciar una nueva.');
      }
    }
  });

  ManufacturingOrder.addHook('beforeUpdate', async (order) => {
    if (order.state === 'iniciado') {
      const activeManufacturingOrder = await ManufacturingOrder.findOne({
        where: { 
          state: 'iniciado',
          id: { [require('sequelize').Op.ne]: order.id }
        }
      });
      
      if (activeManufacturingOrder) {
        throw new Error('Ya existe una orden de fabricación iniciada. Debe finalizar la orden actual antes de iniciar una nueva.');
      }
    }
  });

  ManufacturingOrder.associate = models => {
    ManufacturingOrder.hasMany(models.Pause, {
      foreignKey: 'orderId',
      as: 'pauses'
    });
  };

  return ManufacturingOrder;
};
