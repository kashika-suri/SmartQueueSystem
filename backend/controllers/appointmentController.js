const Appointment = require("../models/Appointment");


// ======================
// Book Appointment
// ======================

const bookAppointment = async (req, res) => {

  try {

    const { patient, doctor, date } = req.body;


    const lastAppointment = await Appointment.findOne({

      doctor,
      date,

    }).sort({

      token:-1,

    });



    const token = lastAppointment

      ? lastAppointment.token + 1

      : 1;



    const queuePosition = token;


    const waitingTime =
      (queuePosition - 1) * 10;




    const appointment = new Appointment({

      patient,

      doctor,

      date,

      token,

      queuePosition,

      waitingTime,

    });




    await appointment.save();




    const io = req.app.get("io");



    console.log("✅ Appointment Booked");

    console.log("Patient:", patient);

    console.log("Doctor:", doctor);

    console.log("Token:", token);




    io.emit(

      "appointmentBooked",

      appointment

    );





    res.status(201).json({

      message:"Appointment Booked Successfully",

      appointment,

      queuePosition,

      waitingTime,

    });



  }

  catch(err){


    console.log(err);


    res.status(500).json({

      message:err.message,

    });


  }


};





// ======================
// Get All Appointments
// ======================

const getAppointments = async(req,res)=>{


  try{


    const appointments = await Appointment.find()


    .populate(
      "patient",
      "name email"
    )


    .sort({

      date:1,

      doctor:1,

      token:1,

    });



    res.json(appointments);



  }


  catch(err){


    console.log(err);


    res.status(500).json({

      message:err.message,

    });


  }


};
// ======================
// Get Patient Appointments
// ======================

const getPatientAppointments = async (req, res) => {

  try {


    const appointments = await Appointment.find({

      patient:req.params.id,

    })


    .populate(

      "patient",

      "name email"

    )


    .sort({

      date:-1,

    });




    res.json(appointments);



  }

  catch(err){


    console.log(err);



    res.status(500).json({

      message:err.message,

    });


  }


};






// ======================
// Get Doctor Appointments
// ======================

const getDoctorAppointments = async (req,res)=>{


  try{


    const appointments = await Appointment.find({

      doctor:req.params.name,

    })


    .populate(

      "patient",

      "name email"

    )


    .sort({

      token:1,

    });




    res.json(appointments);



  }


  catch(err){


    console.log(err);



    res.status(500).json({

      message:err.message,

    });


  }


};
// ======================
// Update Appointment Status
// ======================

const updateAppointmentStatus = async (req,res)=>{


  try{


    const {status} = req.body;



    console.log("\n==============================");

    console.log("📌 Update Status Request");

    console.log("Appointment ID:", req.params.id);

    console.log("New Status:", status);

    console.log("==============================");





    let appointment = await Appointment.findByIdAndUpdate(


      req.params.id,


      {

        status,

      },


      {

        new:true,

      }


    );





    if(!appointment){


      return res.status(404).json({

        message:"Appointment not found",

      });


    }





    console.log("✅ Appointment Updated");

    console.log(
      "Patient:",
      appointment.patient.toString()
    );

    console.log(
      "Doctor:",
      appointment.doctor
    );

    console.log(
      "Token:",
      appointment.token
    );






    const io = req.app.get("io");







    // ===============================
    // Notify Patient When Turn Comes
    // ===============================


    if(status==="In Progress"){



      console.log(
        "🔥 STATUS CHANGED TO IN PROGRESS"
      );



      io.to(

        appointment.patient.toString()

      )

      .emit(

        "yourTurn",

        {


          message:"It's your turn!",


          doctor:appointment.doctor,


          token:appointment.token,


          appointmentId:appointment._id,


        }

      );



      console.log(
        "✅ yourTurn event emitted"
      );



    }








    // ===============================
    // Automatic Next Patient
    // ===============================


    if(

      status==="Completed" ||

      status==="Cancelled"

    ){



      const nextPatient = await Appointment.findOne({


        doctor:appointment.doctor,


        date:appointment.date,


        status:"Waiting",


      })


      .sort({

        token:1,

      });






      if(nextPatient){



        nextPatient.status="In Progress";


        await nextPatient.save();





        console.log(
          "➡️ Next Patient Found"
        );

        console.log(
          "Token:",
          nextPatient.token
        );





        io.to(

          nextPatient.patient.toString()

        )

        .emit(

          "yourTurn",

          {


            message:"It's your turn!",


            doctor:nextPatient.doctor,


            token:nextPatient.token,


            appointmentId:nextPatient._id,


          }


        );



        console.log(
          "✅ Next patient notified"
        );



      }



    }
    // ===============================
// Update Queue Positions
// ===============================


    const waitingAppointments = await Appointment.find({


      doctor:appointment.doctor,


      date:appointment.date,


      status:"Waiting",


    })


    .sort({


      token:1,


    });





    for(
      let i = 0;
      i < waitingAppointments.length;
      i++
    ){


      waitingAppointments[i].queuePosition =
        i + 1;



      waitingAppointments[i].waitingTime =
        i * 10;




      await waitingAppointments[i].save();



    }





    console.log(
      "✅ Queue updated"
    );







    // ===============================
    // Notify All Dashboards
    // ===============================


    io.emit(

      "statusUpdated",

      appointment

    );



    console.log(
      "📢 statusUpdated emitted"
    );






    res.json({


      message:"Status Updated Successfully",


      appointment,


    });




  }


  catch(err){



    console.log(
      "❌ Error:",
      err
    );



    res.status(500).json({


      message:err.message,


    });



  }


};







module.exports = {


  bookAppointment,


  getAppointments,


  getPatientAppointments,


  getDoctorAppointments,


  updateAppointmentStatus,


};