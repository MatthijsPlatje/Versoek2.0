'use strict';
module.exports = (sequelize, DataTypes) => {
  const RideRequest = sequelize.define('RideRequest', {
    // --- ARGUMENT 1: Attributes ---
    status: { type: DataTypes.ENUM('pending', 'accepted', 'refused'), defaultValue: 'pending' },
    pickupLocation: { type: DataTypes.JSON, allowNull: false },
  }, {
    // --- ARGUMENT 2: Options ---
    underscored: true,
  });

  RideRequest.associate = (models) => {
    RideRequest.belongsTo(models.Ride, { foreignKey: 'rideId' });
    RideRequest.belongsTo(models.User, { as: 'passenger', foreignKey: 'passengerId' });
  };

  return RideRequest;
};
