require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');

const data = [
  { number: 'DL1CAB1234', type: 'Cab', driverName: 'Rajesh Kumar', phone: '9811100001', licenseNo: 'DL-0420110012345' },
  { number: 'UP16AT5678', type: 'Auto', driverName: 'Sunil Yadav', phone: '9811100002', licenseNo: 'UP-1620150067890' },
  { number: 'DL1PC9012', type: 'Bus', driverName: 'Mohan Singh', phone: '9811100003', licenseNo: 'DL-0120090034567' }
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Vehicle.deleteMany({});
  await Vehicle.insertMany(data);
  console.log('Seeded');
  process.exit();
});