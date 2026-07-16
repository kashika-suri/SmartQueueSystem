const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getPatients,
} = require("../controllers/authController");

// Register
router.post("/signup", signup);

// Login
router.post("/login", login);

// Get All Patients (Admin)
router.get("/patients", getPatients);

module.exports = router;