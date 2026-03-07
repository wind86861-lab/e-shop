const express = require('express');
const router = express.Router();
const PageContent = require('../models/PageContent');
const { protect, admin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { page } = req.query;
    const query = {};
    if (page) query.page = page;
    const content = await PageContent.find(query);
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:page/:section', async (req, res) => {
  try {
    const content = await PageContent.findOne({
      page: req.params.page,
      section: req.params.section,
    });
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/', protect, admin, async (req, res) => {
  try {
    const { page, section, content } = req.body;
    const result = await PageContent.findOneAndUpdate(
      { page, section },
      { page, section, content },
      { upsert: true, new: true }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const content = await PageContent.findByIdAndDelete(req.params.id);
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json({ message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
