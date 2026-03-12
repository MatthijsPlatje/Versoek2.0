// /server/services/rideScheduler.js

const cron = require('node-cron');
const { RecurringRide, Ride } = require('../models');
const { eachDayOfInterval, addDays, startOfToday, parseISO, isBefore, isAfter, isEqual } = require('date-fns');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');

const generateRidesFromRules = async () => {
  console.log('Scheduler running: Generating rides from recurring rules...');

  const today = startOfToday();

  // Fetch only rules that are currently active
  const rules = await RecurringRide.findAll({
    where: {
      startDate: { [Op.lte]: today },
      [Op.or]: [
        { endDate: { [Op.is]: null } },
        { endDate: { [Op.gte]: today } },
      ],
    }
  });

  if (rules.length === 0) {
    console.log('Scheduler finished: No active recurring rules found.');
    return;
  }

  const interval = {
    start: today,
    end: addDays(today, 7) // Generate rides for the next 7 days
  };

  const daysInInterval = eachDayOfInterval(interval);

  for (const rule of rules) {
    const daysOfWeek = Array.isArray(rule.daysOfWeek) ? rule.daysOfWeek : JSON.parse(rule.daysOfWeek);
    
    for (const day of daysInInterval) {
      // Ensure the day is within the rule's active range
      const ruleStartDate = parseISO(rule.startDate);
      const ruleEndDate = rule.endDate ? parseISO(rule.endDate) : null;

      const isDayActive = 
        (isEqual(day, ruleStartDate) || isAfter(day, ruleStartDate)) &&
        (!ruleEndDate || isEqual(day, ruleEndDate) || isBefore(day, ruleEndDate));

      if (daysOfWeek.includes(day.getDay()) && isDayActive) {
        const timeString = rule.departureTime; // e.g., "08:30:00"
        
        const year = day.getFullYear();
        const month = String(day.getMonth() + 1).padStart(2, '0');
        const dayNum = String(day.getDate()).padStart(2, '0');
        
        const departureDateTimeString = `${year}-${month}-${dayNum} ${timeString}`;

        // Check if already exists first
        const existing = await Ride.findOne({
          where: {
            driver_id: rule.driverId,
            departureTime: {
              [Op.eq]: departureDateTimeString
            }
          }
        });

        if (existing) {
          console.log(`  Ride already exists for rule #${rule.id} at ${departureDateTimeString}`);
        } else {
          // Use raw query to insert without any timezone conversion
          await Ride.sequelize.query(
            `INSERT INTO rides
              (driver_id, start_point, end_point,
                departure_time, available_seats,
                created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            {
              replacements: [
                rule.driverId,        
                rule.startPoint,
                rule.endPoint,
                departureDateTimeString,
                rule.availableSeats ?? rule.seats ?? 0 // ✅ Fallback for undefined
              ],
              type: Ride.sequelize.QueryTypes.INSERT
            }
          );
          console.log(`✓ Created ride for rule #${rule.id} at ${departureDateTimeString}`);
        }
      }
    }
  }
  console.log('Scheduler finished generating rides.');
};

const scheduleRideGeneration = () => {
  cron.schedule('0 1 * * *', generateRidesFromRules, {
    scheduled: true,
    timezone: "Europe/Amsterdam"
  });
  console.log('Ride generation scheduler has been started (runs daily at 1:00 AM CET/CEST).');
};

module.exports = { scheduleRideGeneration, generateRidesFromRules };
