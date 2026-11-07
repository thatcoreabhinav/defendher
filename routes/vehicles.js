const router = require('express').Router();
const Vehicle = require('../models/Vehicle');

router.get('/:number', async (req, res) => {
  const number = req.params.number.toUpperCase().replace(/\s/g, '');
  const v = await Vehicle.findOne({ number });
  if (!v) return res.status(404).json({ registered: false });
  res.json({ registered: true, ...v.toObject() });
});

module.exports = router;