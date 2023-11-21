// models/entryModel.js

const  mongoose = require('mongoose');
const entrySchema = new mongoose.Schema({
  MSISDN: String,
  quantity: Number,
  narration: String,
});

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;
