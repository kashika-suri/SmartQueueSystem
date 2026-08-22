const express = require("express");

const router = express.Router();

const {

  bookAppointment,

  getAppointments,

  getPatientAppointments,

  getDoctorAppointments,

  updateAppointmentStatus

} = require("../controllers/appointmentController");

// ======================
// Book Appointment
// ======================

router.post(

  "/book",

  bookAppointment

);

// ======================
// Get All Appointments
// ======================

router.get(

  "/",

  getAppointments

);

// ======================
// Get Patient Appointments
// ======================

router.get(

  "/patient/:id",

  getPatientAppointments

);

// ======================
// Get Doctor Appointments
// ======================

router.get(

  "/doctor/:name",

  getDoctorAppointments

);

// ======================
// Update Appointment Status
// ======================

router.put(

  "/:id/status",

  updateAppointmentStatus

);

module.exports = router;