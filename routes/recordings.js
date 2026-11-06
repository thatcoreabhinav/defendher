const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');

fs.mkdirSync('uploads', { recursive: true });
const upload = multer({ dest: 'uploads/' });

router.post('/:alertId', upload.single('video'), (req, res) => {
  fs.renameSync(req.file.path, `uploads/${req.params.alertId}-${Date.now()}.webm`);
  res.json({ ok: true });
});

module.exports = router;