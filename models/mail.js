const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mailSchema = new Schema({
  ID: {
    type: String,
    required: true,
  },
  From: {
    type: String,
    required: true,
  },
  Subject: {
    type: String,
  },
  Body: {
    type: String,
  },
  Status: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const Mail = mongoose.model('Mail', mailSchema);
module.exports = Mail;