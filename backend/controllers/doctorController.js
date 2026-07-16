const Doctor = require("../models/Doctor");

// Get All Doctors
const getDoctors = async (req, res) => {
  try {

    const doctors = await Doctor.find();

    res.json(doctors);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
};

module.exports = {
  getDoctors,
};