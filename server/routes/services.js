const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, customerId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (customerId) {
      query.customer = customerId;
    }

    const services = await Service.find(query)
      .populate('customer', 'firstName lastName email phone')
      .populate('technician', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Service.countDocuments(query);

    res.json({
      services,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('customer')
      .populate('technician', 'name email');
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const service = await Service.create(req.body);
    
    if (service.status === 'completed' && service.paymentStatus === 'paid') {
      await Customer.findByIdAndUpdate(service.customer, {
        $inc: { totalSpent: service.totalCost },
        lastVisit: new Date(),
      });
    }

    const populatedService = await Service.findById(service._id)
      .populate('customer', 'firstName lastName email phone')
      .populate('technician', 'name email');
    
    res.status(201).json(populatedService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const oldService = await Service.findById(req.params.id);
    
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('customer', 'firstName lastName email phone')
      .populate('technician', 'name email');
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.status === 'completed' && service.paymentStatus === 'paid' && 
        (oldService.status !== 'completed' || oldService.paymentStatus !== 'paid')) {
      await Customer.findByIdAndUpdate(service.customer, {
        $inc: { totalSpent: service.totalCost },
        lastVisit: new Date(),
      });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
