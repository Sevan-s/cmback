const mongoose = require('mongoose');

const OpinionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Opinion', OpinionSchema);