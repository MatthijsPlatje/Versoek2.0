'use strict';
module.exports = (sequelize, DataTypes) => {
  const RecurringRide = sequelize.define('RecurringRide', {
    // --- ARGUMENT 1: Attributes ---
    startPoint: {
      type: DataTypes.TEXT, // Using TEXT to hold the full { name, lat, lng } JSON string
      allowNull: false,
    },
    endPoint: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    daysOfWeek: {
      type: DataTypes.JSON, // Stores an array like [1, 2, 3] (0=Sunday, 1=Monday)
      allowNull: false,
    },
    departureTime: {
      type: DataTypes.TIME, // Stores the time of day, e.g., '08:00:00'
      allowNull: false,
    },
    seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    // --- NEW ---: Added start and end dates for the rule
    startDate: {
      type: DataTypes.DATEONLY, // The date the recurrence begins
      allowNull: false,
      defaultValue: DataTypes.NOW, // Defaults to the date of creation
    },
    endDate: {
      type: DataTypes.DATEONLY, // An optional end date for the recurrence
      allowNull: true,
    },
  }, {
    // --- ARGUMENT 2: Options ---
    underscored: true,
  });

  RecurringRide.associate = (models) => {
    // A recurring ride rule belongs to one user (the driver)
    RecurringRide.belongsTo(models.User, { as: 'driver', foreignKey: 'driverId' });
  };

  return RecurringRide;
};
