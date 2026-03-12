'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    // --- ARGUMENT 1: Attributes ---
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true // This field is optional
    },
    
    profilePictureUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '/uploads/default-avatar.png' // A default image if none is uploaded
    },

    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    terms_accepted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    underscored: true,
  });

  User.associate = (models) => {
    // A user can be the driver of many single rides
    User.hasMany(models.Ride, { as: 'drivenRides', foreignKey: 'driverId' });

    // A user can make many requests to join rides
    User.hasMany(models.RideRequest, { as: 'requests', foreignKey: 'passengerId' });

    // A user can create many recurring ride rules
    User.hasMany(models.RecurringRide, { as: 'recurringRides', foreignKey: 'driverId' });
  };

  return User;
};
