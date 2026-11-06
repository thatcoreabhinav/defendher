const router = require('express').Router();
const Alert = require('../models/alert');

// SOS trigger
router.post('/', async (req, res) => {
  const { userName, contacts, location } = req.body;
  const alert = await Alert.create({
    userName,
    contacts,
    lastLocation: { ...location, at: new Date() },
    path: [{ ...location, at: new Date() }]
  });
  res.status(201).json({ id: alert._id });
});

// location update (also keeps "last seen")
router.patch('/:id/location', async (req, res) => {
  const { lat, lng } = req.body;
  const alert = await Alert.findByIdAndUpdate(req.params.id, {
    lastLocation: { lat, lng, at: new Date() },
    $push: { path: { lat, lng, at: new Date() } }
  }, { new: true });
  res.json(alert);
});

// get one alert (the tracking page will use this)
router.get('/:id', async (req, res) => {
  res.json(await Alert.findById(req.params.id));
});

// stop the SOS
router.patch('/:id/stop', async (req, res) => {
  res.json(await Alert.findByIdAndUpdate(req.params.id, { active: false }, { new: true }));
});

module.exports = router;