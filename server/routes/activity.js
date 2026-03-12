const express = require('express');
const router = express.Router();
const { Ride, RideRequest, User } = require('../models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/', authMiddleware, async (req, res) => {
  const { month, year } = req.query;
  const userId = req.user.id;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  try {
    const drivenRides = await Ride.findAll({
      where: {
        driverId: userId,
        departureTime: { [Op.between]: [startDate, endDate] },
      },
      include: [{
        model: RideRequest,
        as: 'requests', // Use the alias to fetch associated requests
        include: {
          model: User,
          as: 'passenger', // And fetch the passenger for each request
          attributes: ['id', 'name'],
        },
      }],
      order: [['departureTime', 'ASC']],
    });

    const requestedRides = await RideRequest.findAll({
      where: { passengerId: userId },
      include: {
        model: Ride,
        where: { departureTime: { [Op.between]: [startDate, endDate] } },
        include: { model: User, as: 'driver', attributes: ['id', 'name'] },
      },
      order: [['createdAt', 'DESC']],
    });

    res.json({ driving: drivenRides, requesting: requestedRides });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Failed to fetch activity.' });
  }
});

module.exports = router;
