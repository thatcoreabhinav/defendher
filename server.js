require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('DB connected'))
  .catch(err => console.log('DB error:', err.message));

app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/recordings', require('./routes/recordings'));
app.listen(process.env.PORT || 3000, () => console.log('Server running on http://localhost:3000'));