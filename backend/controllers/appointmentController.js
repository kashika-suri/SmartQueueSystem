const Appointment = require("../models/Appointment");
const { getRecommendation } = require("../services/slotRecommendationService");

// ======================
// Book Appointment
// ======================

const bookAppointment = async (req, res) => {

  try {

    const {

      patient,

      doctor,

      date,

      slot

    } = req.body;

    const lastAppointment = await Appointment.findOne({

      doctor,

      date,

      slot

    }).sort({

      token: -1

    });

    const token = lastAppointment

      ? lastAppointment.token + 1

      : 1;

    const queuePosition = token;

    const today = new Date();

    const appointmentDate = new Date(date);

    today.setHours(

      0,

      0,

      0,

      0

    );

    appointmentDate.setHours(

      0,

      0,

      0,

      0

    );

    let waitingTime = null;

    let queueStarted = false;

    let queueStatus = "Scheduled";

    if (

      appointmentDate.getTime() ===

      today.getTime()

    ) {

      waitingTime =

        (queuePosition - 1) * 10;

      queueStarted = true;

      queueStatus = "Running";

    }

    const appointment = new Appointment({

      patient,

      doctor,

      date,

      slot,

      token,

      queuePosition,

      waitingTime,

      queueStarted,

      queueStatus

    });

    await appointment.save();

    const io = req.app.get("io");

    if (io) {

      io.emit(

        "appointmentBooked",

        appointment

      );

    }

    res.status(201).json({

      message: "Appointment Booked Successfully",

      appointment

    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({

      message: err.message

    });

  }

};

// ======================
// AI Slot Recommendation
// ======================

const recommendSlot = async (req, res) => {
  try {
    const { doctor, date } = req.query;

    if (!doctor || !date) {
      return res.status(400).json({
        message: "Doctor and date are required"
      });
    }

    const recommendation = await getRecommendation(doctor, date);

    res.json(recommendation);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message
    });
  }
};

// ======================
// Get All Appointments
// ======================

const getAppointments = async (req, res) => {

  try {

    const appointments = await Appointment.find()

      .populate(

        "patient",

        "name email"

      )

      .sort({

        date: 1,

        slot: 1,

        doctor: 1,

        token: 1

      });

    res.json(

      appointments

    );

  }

  catch (err) {

    console.log(err);

    res.status(500).json({

      message: err.message

    });

  }

};

// ======================
// Get Patient Appointments
// ======================

const getPatientAppointments = async (req, res) => {

  try {

    const appointments = await Appointment.find({

      patient: req.params.id

    })

      .populate(

        "patient",

        "name email"

      )

      .sort({

        date: 1,

        slot: 1,

        token: 1

      });

    const today = new Date();

    today.setHours(

      0,

      0,

      0,

      0

    );

    const updatedAppointments = appointments.map(

      (appointment) => {

        const appointmentObj = appointment.toObject();

        const appointmentDate = new Date(

          appointment.date

        );

        appointmentDate.setHours(

          0,

          0,

          0,

          0

        );

        if (appointmentDate > today) {

          appointmentObj.queueStarted = false;

          appointmentObj.queueStatus = "Scheduled";

          appointmentObj.waitingTime = null;

          appointmentObj.patientsAhead = null;

        }

        else if (

          appointmentDate.getTime() ===

          today.getTime()

        ) {

          appointmentObj.queueStarted = true;

          appointmentObj.queueStatus = "Running";

          if (

            appointmentObj.status === "Waiting"

          ) {

            const patientsAhead = appointments.filter(

              (item) =>

                item.doctor === appointment.doctor &&

                item.date === appointment.date &&

                item.slot === appointment.slot &&

                item.status === "Waiting" &&

                item.token < appointment.token

            ).length;

            appointmentObj.patientsAhead = patientsAhead;

            appointmentObj.waitingTime =

              patientsAhead * 10;

          }

        }

        else {

          appointmentObj.queueStarted = false;

          appointmentObj.queueStatus = "Completed";

          appointmentObj.waitingTime = null;

        }

        return appointmentObj;

      }

    );

    res.json(

      updatedAppointments

    );

  }

  catch (err) {

    console.log(err);

    res.status(500).json({

      message: err.message

    });

  }

};
// ======================
// Get Doctor Appointments
// ======================

const getDoctorAppointments = async (req, res) => {

  try {

    const appointments = await Appointment.find({

      doctor: req.params.name

    })

      .populate(

        "patient",

        "name email"

      )

      .sort({

        date: 1,

        slot: 1,

        token: 1

      });

    res.json(

      appointments

    );

  }

  catch (err) {

    console.log(err);

    res.status(500).json({

      message: err.message

    });

  }

};

// ======================
// Update Appointment Status
// ======================

const updateAppointmentStatus = async (req, res) => {

  try {

    const { status } = req.body;

    let appointment = await Appointment.findByIdAndUpdate(

      req.params.id,

      {

        status

      },

      {

        new: true

      }

    );

    if (!appointment) {

      return res.status(404).json({

        message: "Appointment not found"

      });

    }

    const io = req.app.get("io");

    if (

      status === "In Progress"

    ) {

      if (io) {

        io.to(

          appointment.patient.toString()

        ).emit(

          "yourTurn",

          {

            message: "Your turn has arrived!",

            doctor: appointment.doctor,

            token: appointment.token,

            slot: appointment.slot,

            appointmentId: appointment._id

          }

        );

      }

    }

    if (

      status === "Completed" ||

      status === "Cancelled"

    ) {

      const nextPatient = await Appointment.findOne({

        doctor: appointment.doctor,

        date: appointment.date,

        slot: appointment.slot,

        status: "Waiting"

      })

      .sort({

        token: 1

      });
            if (nextPatient) {

        nextPatient.status = "In Progress";

        await nextPatient.save();

        if (io) {

          io.to(

            nextPatient.patient.toString()

          ).emit(

            "yourTurn",

            {

              message: "Your turn has arrived!",

              doctor: nextPatient.doctor,

              token: nextPatient.token,

              slot: nextPatient.slot,

              appointmentId: nextPatient._id

            }

          );

        }

      }

    }

    const waitingAppointments = await Appointment.find({

      doctor: appointment.doctor,

      date: appointment.date,

      slot: appointment.slot,

      status: "Waiting"

    })

    .sort({

      token: 1

    });

    const today = new Date();

    today.setHours(

      0,

      0,

      0,

      0

    );

    const appointmentDate = new Date(

      appointment.date

    );

    appointmentDate.setHours(

      0,

      0,

      0,

      0

    );

    const queueStarted =

      appointmentDate.getTime() ===

      today.getTime();

    for (

      let i = 0;

      i < waitingAppointments.length;

      i++

    ) {

      waitingAppointments[i].queuePosition =

        i + 1;

      if (queueStarted) {

        waitingAppointments[i].waitingTime =

          i * 10;

        waitingAppointments[i].queueStarted = true;

        waitingAppointments[i].queueStatus = "Running";

      }

      else {

        waitingAppointments[i].waitingTime = null;

        waitingAppointments[i].queueStarted = false;

        waitingAppointments[i].queueStatus = "Scheduled";

      }

      await waitingAppointments[i].save();

    }

    if (io) {

      io.emit(

        "statusUpdated",

        appointment

      );

    }

    res.json({

      message: "Status Updated Successfully",

      appointment

    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({

      message: err.message

    });

  }

};
module.exports = {

  bookAppointment,

  getAppointments,

  getPatientAppointments,

  getDoctorAppointments,

  updateAppointmentStatus,

  recommendSlot

};