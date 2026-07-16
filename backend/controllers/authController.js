const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ======================
// Signup
// ======================

const signup = async (req, res) => {
  try {

    const { name, email, password, phone, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
};

// ======================
// Login
// ======================

const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login Successful",
      token,
      user,
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
};

// ======================
// Get All Patients
// ======================

const getPatients = async (req, res) => {

  try {

    const patients = await User.find(
      { role: "patient" },
      "-password"
    );

    res.json(patients);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }

};

module.exports = {
  signup,
  login,
  getPatients,
};