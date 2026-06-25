const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'satchel_dev_secret',
  JWT_EXPIRES_IN: '7d',
  SHIPPING_FLAT_RATE: 8
};
