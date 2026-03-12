// server/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const { Ride, RideRequest, User, sequelize } = require('../models');

const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const { startOfMonth, format, subMonths, startOfDay, endOfDay, differenceInHours } = require('date-fns');
const { Parser } = require('json2csv');

// --- Utility function to calculate distance (Haversine formula) ---
function getDistance(lat1, lon1, lat2, lon2) {
    if ([lat1, lon1, lat2, lon2].some(coord => coord === null || coord === undefined)) {
        return 0;
    }
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// --- Utility function to calculate CO2 savings ---
function calculateCO2Savings(distanceKm, passengers) {
    // Average car emits 0.12 kg CO2 per km
    // Carpooling saves (passengers - 1) cars from the road
    const CO2_PER_KM = 0.12;
    return distanceKm * (passengers) * CO2_PER_KM;
}

// --- Utility function to convert CO2 to trees equivalent ---
function co2ToTrees(co2Kg) {
    // One tree absorbs approximately 21 kg of CO2 per year
    return (co2Kg / 21).toFixed(1);
}

// --- MAIN STATS ENDPOINT ---
router.get('/stats', [auth, adminAuth], async (req, res) => {
    try {
        const now = new Date();
        const sixMonthsAgo = startOfMonth(subMonths(now, 5));
        const thirtyDaysAgo = subMonths(now, 1);

        // --- 1. BASIC KPIs ---
        const totalUsers = await User.count();
        const totalRides = await Ride.count();
        const totalAcceptedRequests = await RideRequest.count({ where: { status: 'accepted' } });
        const totalPendingRequests = await RideRequest.count({ where: { status: 'pending' } });
        const totalRefusedRequests = await RideRequest.count({ where: { status: 'refused' } });

        // Query 1: Get all rides with coordinates
        const allRides = await Ride.findAll({ 
            attributes: ['id', 'startPoint', 'endPoint', 'departureTime']
        });

        // Query 2: Get accepted passenger counts per ride
        const acceptedRequests = await RideRequest.findAll({
            where: { status: 'accepted' },
            attributes: [
                'ride_id',
                [fn('COUNT', col('id')), 'passengerCount']
            ],
            group: ['ride_id'],
            raw: true
        });

        // Create lookup map: ride_id → passenger count
        const passengersByRide = {};
        acceptedRequests.forEach(req => {
            passengersByRide[req.ride_id] = parseInt(req.passengerCount);
        });

        let totalDistance = 0;
        let totalCO2Saved = 0;
        let validRidesForDistance = 0;
        let completedRidesCount = 0;

        allRides.forEach(ride => {
            try {
                const start = JSON.parse(ride.startPoint);
                const end = JSON.parse(ride.endPoint);
                
                if (start && end && start.lat != null && end.lat != null) {
                    const distance = getDistance(start.lat, start.lng, end.lat, end.lng);
                    const passengerCount = passengersByRide[ride.id] || 0;
                    
                    if (passengerCount > 0) {
                        totalDistance += distance;
                        validRidesForDistance++;
                        const co2ForRide = calculateCO2Savings(distance, passengerCount);
                        totalCO2Saved += co2ForRide;
                        completedRidesCount++;
                        
                        // Debug: Log each calculation
                        console.log(`Ride ${ride.id}: ${distance.toFixed(2)}km × ${passengerCount} passengers = ${co2ForRide.toFixed(2)}kg CO2`);
                    }
                }
            } catch (e) {
                console.warn(`Skipping ride ${ride.id} for distance calculation:`, e.message);
            }
        });

        const averageDistance = validRidesForDistance > 0 ? (totalDistance / validRidesForDistance).toFixed(2) : 0;
        const treesEquivalent = co2ToTrees(totalCO2Saved);

        // --- 3. DRIVER UTILIZATION ---
        const driversWithRides = await Ride.findAll({
            attributes: [[fn('COUNT', fn('DISTINCT', col('driver_id'))), 'count']]
        });
        const activeDrivers = driversWithRides[0]?.dataValues?.count || 0;
        const driverUtilization = totalUsers > 0 ? ((activeDrivers / totalUsers) * 100).toFixed(1) : 0;

        // --- 4. OCCUPANCY RATE ---
        const ridesWithSeats = await Ride.findAll({
            attributes: ['id', 'availableSeats'],
            include: [{
                model: RideRequest,
                as: 'requests',
                where: { status: 'accepted' },
                required: false
            }]
        });

        let totalSeatsOffered = 0;
        let totalSeatsFilled = 0;

        ridesWithSeats.forEach(ride => {
            const seatsOffered = ride.availableSeats || 0;
            const seatsFilled = ride.requests ? ride.requests.length : 0;
            totalSeatsOffered += seatsOffered;
            totalSeatsFilled += seatsFilled;
        });

        const occupancyRate = totalSeatsOffered > 0 ? ((totalSeatsFilled / totalSeatsOffered) * 100).toFixed(1) : 0;

        // --- 5. REQUEST ACCEPTANCE RATE ---
        const totalRequests = totalAcceptedRequests + totalRefusedRequests;
        const acceptanceRate = totalRequests > 0 ? ((totalAcceptedRequests / totalRequests) * 100).toFixed(1) : 0;

        // --- 6. AVERAGE RESPONSE TIME ---
        const requestsWithTimes = await RideRequest.findAll({
            where: {
                status: { [Op.in]: ['accepted', 'refused'] },
                updatedAt: { [Op.gte]: thirtyDaysAgo }
            },
            attributes: ['createdAt', 'updatedAt']
        });

        let totalResponseHours = 0;
        requestsWithTimes.forEach(req => {
            const hours = differenceInHours(req.updatedAt, req.createdAt);
            totalResponseHours += hours;
        });

        const avgResponseTime = requestsWithTimes.length > 0 
            ? (totalResponseHours / requestsWithTimes.length).toFixed(1) 
            : 0;

        // --- 7. ACTIVE USERS TREND (Last 30 Days) ---
        const activeUsersByDay = await Ride.findAll({
            where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
            attributes: [
                [fn('DATE', col('created_at')), 'date'],
                [fn('COUNT', fn('DISTINCT', col('driver_id'))), 'count']
            ],
            group: [fn('DATE', col('created_at'))],
            raw: true
        });

        const activeUsersOverTime = {};
        activeUsersByDay.forEach(item => {
            activeUsersOverTime[item.date] = parseInt(item.count);
        });

        // --- 8. RIDES OVER TIME (Last 6 Months) ---
        const monthLabels = Array.from({ length: 6 }).map((_, i) => {
            return format(subMonths(now, 5 - i), 'yyyy-MM');
        });

        const ridesOverTime = Object.fromEntries(monthLabels.map(m => [m, 0]));
        const acceptedOverTime = Object.fromEntries(monthLabels.map(m => [m, 0]));

        const ridesSince = await Ride.findAll({ 
            where: { createdAt: { [Op.gte]: sixMonthsAgo } }, 
            attributes: ['createdAt'] 
        });
        
        ridesSince.forEach(ride => {
            const month = format(ride.createdAt, 'yyyy-MM');
            if (ridesOverTime.hasOwnProperty(month)) {
                ridesOverTime[month]++;
            }
        });

        const requestsSince = await RideRequest.findAll({ 
            where: { 
                status: 'accepted', 
                createdAt: { [Op.gte]: sixMonthsAgo } 
            }, 
            attributes: ['createdAt'] 
        });
        
        requestsSince.forEach(req => {
            const month = format(req.createdAt, 'yyyy-MM');
            if (acceptedOverTime.hasOwnProperty(month)) {
                acceptedOverTime[month]++;
            }
        });

        // --- 9. PEAK USAGE HOURS ---
        const ridesWithHours = await Ride.findAll({
            where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
            attributes: ['departureTime']
        });

        const hourCounts = Array(24).fill(0);
        ridesWithHours.forEach(ride => {
            const hour = new Date(ride.departureTime).getHours();
            hourCounts[hour]++;
        });

        // --- 10. REQUEST STATUS DISTRIBUTION ---
        const requestStatusDistribution = {
            pending: totalPendingRequests,
            accepted: totalAcceptedRequests,
            refused: totalRefusedRequests
        };

        // --- 11. NEW USER REGISTRATIONS (Last 6 Months) ---
        const usersSince = await User.findAll({
            where: { createdAt: { [Op.gte]: sixMonthsAgo } },
            attributes: ['createdAt']
        });

        const newUsersOverTime = Object.fromEntries(monthLabels.map(m => [m, 0]));
        usersSince.forEach(user => {
            const month = format(user.createdAt, 'yyyy-MM');
            if (newUsersOverTime.hasOwnProperty(month)) {
                newUsersOverTime[month]++;
            }
        });

        // --- 12. COMPLETION RATE ---
        const pastRides = await Ride.findAll({
            where: { departureTime: { [Op.lt]: now } }
        });
        const completionRate = pastRides.length > 0 
            ? ((completedRidesCount / pastRides.length) * 100).toFixed(1) 
            : 0;

        // --- SEND COMPREHENSIVE RESPONSE ---
        res.json({
            kpis: {
                totalUsers,
                totalRides,
                totalAcceptedRequests,
                averageDistance,
                totalCO2Saved: totalCO2Saved.toFixed(2),
                treesEquivalent,
                driverUtilization,
                occupancyRate,
                acceptanceRate,
                avgResponseTime,
                completionRate,
                activeDrivers,
                totalDistance: totalDistance.toFixed(2)
            },
            charts: {
                ridesOverTime,
                acceptedOverTime,
                activeUsersOverTime,
                peakHours: hourCounts,
                requestStatusDistribution,
                newUsersOverTime
            }
        });

    } catch (err) {
        console.error("ERROR IN /api/dashboard/stats ROUTE:", err);
        res.status(500).send('Server Error');
    }
});

// --- EXPORT RIDES ENDPOINT (UNCHANGED) ---
router.get('/export/rides', [auth, adminAuth], async (req, res) => {
    try {
        const rides = await Ride.findAll({
            include: [{
                model: User,
                as: 'driver',
                attributes: ['name', 'email']
            }],
            order: [['departureTime', 'DESC']]
        });

        const ridesJson = rides.map(ride => {
            let startPoint, endPoint;
            try { startPoint = JSON.parse(ride.startPoint).name; } catch { startPoint = "Invalid"; }
            try { endPoint = JSON.parse(ride.endPoint).name; } catch { endPoint = "Invalid"; }

            return {
                ride_id: ride.id,
                driver_name: ride.driver ? ride.driver.name : 'N/A',
                driver_email: ride.driver ? ride.driver.email : 'N/A',
                departure_time: ride.departureTime,
                start_point_name: startPoint,
                end_point_name: endPoint,
                available_seats: ride.availableSeats,
                created_at: ride.createdAt,
            }
        });

        const fields = ['ride_id', 'driver_name', 'driver_email', 'departure_time', 'start_point_name', 'end_point_name', 'available_seats', 'created_at'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(ridesJson);

        res.header('Content-Type', 'text/csv');
        res.attachment('rides-export.csv');
        res.send(csv);

    } catch (err) {
        console.error("ERROR IN /api/dashboard/export/rides ROUTE:", err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
