// models/CleaningOrder.js
module.exports = (sequelize, DataTypes) => {
  const CleaningOrder = sequelize.define('CleaningOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Descripción de la orden de limpieza'
    },
    state: {
      type: DataTypes.ENUM('creada', 'iniciada', 'finalizada'),
      allowNull: false,
      defaultValue: 'creada',
      comment: 'Estado actual de la orden de limpieza'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha y hora de inicio de la limpieza'
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha y hora de finalización de la limpieza'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duración en minutos de la limpieza'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'cleaning_orders',
    timestamps: true,
    comment: 'Tabla para gestionar órdenes de limpieza'
  });

  // Hook para calcular duración automáticamente
  CleaningOrder.addHook('beforeSave', (order) => {
    if (order.startTime && order.endTime) {
      const start = new Date(order.startTime);
      const end = new Date(order.endTime);
      order.duration = Math.round((end - start) / (1000 * 60)); // minutos
    }
    
    // Establecer startTime cuando se inicia
    if (order.state === 'iniciada' && !order.startTime) {
      order.startTime = new Date();
    }
    
    // Establecer endTime cuando se finaliza
    if (order.state === 'finalizada' && !order.endTime) {
      order.endTime = new Date();
    }
  });

  // Validación: Solo una orden de limpieza puede estar iniciada
  CleaningOrder.addHook('beforeCreate', async (order) => {
    if (order.state === 'iniciada') {
      const activeCleaningOrder = await CleaningOrder.findOne({
        where: { state: 'iniciada' }
      });
      
      if (activeCleaningOrder) {
        throw new Error('Ya existe una orden de limpieza iniciada. Debe finalizar la orden actual antes de iniciar una nueva.');
      }
    }
  });

  CleaningOrder.addHook('beforeUpdate', async (order) => {
    if (order.state === 'iniciada') {
      const activeCleaningOrder = await CleaningOrder.findOne({
        where: { 
          state: 'iniciada',
          id: { [require('sequelize').Op.ne]: order.id }
        }
      });
      
      if (activeCleaningOrder) {
        throw new Error('Ya existe una orden de limpieza iniciada. Debe finalizar la orden actual antes de iniciar una nueva.');
      }
    }
  });

  return CleaningOrder;
};