// models/entryModel.js

const  mongoose = require('mongoose');
const entrySchema = new mongoose.Schema({
  MSISDN: { type: String, required: true },
  quantity: { type: Number, required: true },
  narration: { type: String, required: true },
});

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;
