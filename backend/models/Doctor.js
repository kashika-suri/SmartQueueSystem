const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
  },

  specialization: {
    type: String,
    required: true,
  },

  experience: {
    type: Number,
    default: 0,
  },

  available: {
    type: Boolean,
    default: true,
  }

});

module.exports = mongoose.model("Doctor", doctorSchema);