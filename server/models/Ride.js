'use strict';
module.exports = (sequelize, DataTypes) => {
  const Ride = sequelize.define('Ride', {
    // --- ARGUMENT 1: Attributes ---
    startPoint: { type: DataTypes.TEXT, allowNull: false },
    endPoint: { type: DataTypes.TEXT, allowNull: false },
    departureTime: { type: DataTypes.DATE, allowNull: false },
    availableSeats: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    // --- ARGUMENT 2: Options ---
    underscored: true,
  });

  Ride.associate = (models) => {
    Ride.belongsTo(models.User, { as: 'driver', foreignKey: 'driverId' });
    Ride.hasMany(models.RideRequest, { as: 'requests', foreignKey: 'rideId' });
  };

  return Ride;
};
