// backend/testUserModel.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('connected for test');

  // create a test user
  const u = new User({
    name: 'Test User',
    phone: '9999999999',
    email: 'test@example.com',
    password: 'password123'
  });

  await u.save();
  console.log('saved user:', u.toJSON());

  const same = await User.findOne({ phone: '9999999999' });
  const ok = await same.matchPassword('password123');
  console.log('password match:', ok);

  await User.deleteOne({ _id: u._id });
  await mongoose.disconnect();
  console.log('cleaned up and disconnected');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
