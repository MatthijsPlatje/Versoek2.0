// server/models/Notification.js

'use strict';
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    // Attributes
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    rideId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for general notifications
    },
  }, {
    // This tells Sequelize to map camelCase attributes to snake_case columns
    // e.g., 'userId' -> 'user_id', 'createdAt' -> 'created_at'
    underscored: true,
  });

  Notification.associate = (models) => {
    // A notification belongs to one user
    Notification.belongsTo(models.User, {
      foreignKey: 'userId', // Sequelize will map this to user_id in the database
      onDelete: 'CASCADE',
    });
  };

  return Notification;
};
