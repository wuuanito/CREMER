// models/Pause.js
module.exports = (sequelize, DataTypes) => {
  const Pause = sequelize.define('Pause', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'manufacturing_orders',
        key: 'id'
      },
      comment: 'FK a la orden'
    },
    pauseType: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Tipo de pausa'
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Comentarios'
    },
    startPause: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Hora inicio pausa'
    },
    endPause: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Hora fin pausa'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Duración de la pausa (minutos)'
    }
  }, {
    tableName: 'pauses',
    timestamps: false
  });

  Pause.associate = models => {
    Pause.belongsTo(models.ManufacturingOrder, {
      foreignKey: 'orderId',
      as: 'order'
    });
  };

  return Pause;
};
