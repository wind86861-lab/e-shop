const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Customer = require('../models/Customer');
const Appointment = require('../models/Appointment');
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [
      totalCustomers,
      totalRevenue,
      monthlyRevenue,
      todayAppointments,
      pendingServices,
      lowStockItems,
      recentServices,
    ] = await Promise.all([
      Customer.countDocuments(),
      Service.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalCost' } } },
      ]),
      Service.aggregate([
        { 
          $match: { 
            paymentStatus: 'paid',
            createdAt: { $gte: thisMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalCost' } } },
      ]),
      Appointment.countDocuments({
        scheduledDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        status: { $ne: 'cancelled' },
      }),
      Service.countDocuments({ status: { $in: ['pending', 'in-progress'] } }),
      Inventory.countDocuments({ $expr: { $lte: ['$quantity', '$minQuantity'] } }),
      Service.find()
        .populate('customer', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const revenueByMonth = await Service.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: new Date(today.getFullYear(), 0, 1) },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalCost' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const servicesByType = await Service.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonth },
        },
      },
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      summary: {
        totalCustomers,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        todayAppointments,
        pendingServices,
        lowStockItems,
      },
      revenueByMonth,
      servicesByType,
      recentServices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
