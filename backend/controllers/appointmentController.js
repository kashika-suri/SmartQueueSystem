const Appointment = require("../models/Appointment");



// ======================
// Book Appointment
// ======================

const bookAppointment = async(req,res)=>{


try{


const {

patient,

doctor,

date

}=req.body;




const lastAppointment = await Appointment.findOne({

doctor,

date

})

.sort({

token:-1

});




const token = lastAppointment

? lastAppointment.token + 1

: 1;



const queuePosition = token;




// ======================
// Queue Logic
// ======================


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





if(
appointmentDate.getTime()
===
today.getTime()
){


waitingTime =

(queuePosition - 1) * 10;


queueStarted = true;


queueStatus = "Running";


}

else{


waitingTime = null;


queueStarted = false;


queueStatus = "Scheduled";


}






const appointment = new Appointment({

patient,

doctor,

date,

token,

queuePosition,

waitingTime,

queueStarted,

queueStatus

});





await appointment.save();





const io = req.app.get("io");



console.log("✅ Appointment Booked");

console.log("Patient:",patient);

console.log("Doctor:",doctor);

console.log("Token:",token);




if(io){

io.emit(

"appointmentBooked",

appointment

);

}





res.status(201).json({

message:
"Appointment Booked Successfully",

appointment,

queuePosition,

waitingTime,

queueStarted,

queueStatus

});



}


catch(err){


console.log(err);


res.status(500).json({

message:err.message

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

token:1

});



res.json(appointments);



}


catch(err){


console.log(err);



res.status(500).json({

message:err.message

});


}



};









// ======================
// Get Patient Appointments
// ======================


const getPatientAppointments = async(req,res)=>{


try{


const appointments = await Appointment.find({


patient:req.params.id


})


.populate(

"patient",

"name email"

)


.sort({

date:1,

token:1

});







const today = new Date();


today.setHours(

0,

0,

0,

0

);








const updatedAppointments = appointments.map(

(appointment)=>{


const appointmentObj =
appointment.toObject();




const appointmentDate =
new Date(

appointment.date

);



appointmentDate.setHours(

0,

0,

0,

0

);







// ======================
// Future Appointment
// ======================


if(
appointmentDate > today
){


appointmentObj.queueStarted = false;


appointmentObj.queueStatus =
"Scheduled";


appointmentObj.waitingTime = null;


appointmentObj.patientsAhead = null;


appointmentObj.estimatedMessage =
"Available on appointment day";


}







// ======================
// Appointment Day
// ======================


else if(

appointmentDate.getTime()

===

today.getTime()

){



appointmentObj.queueStarted = true;


appointmentObj.queueStatus =
"Running";





if(
appointmentObj.status === "Waiting"
){


const patientsAhead =

appointments.filter(

(item)=>


item.doctor === appointment.doctor &&


item.date === appointment.date &&


item.status === "Waiting" &&


item.token < appointment.token


).length;





appointmentObj.patientsAhead =
patientsAhead;


appointmentObj.waitingTime =
patientsAhead * 10;


}



appointmentObj.estimatedMessage =

appointmentObj.waitingTime

?

`${appointmentObj.waitingTime} minutes`

:

"Your turn is next";



}








// ======================
// Past Appointment
// ======================


else{


appointmentObj.queueStarted = false;


appointmentObj.queueStatus =
"Completed";


appointmentObj.waitingTime = null;


appointmentObj.estimatedMessage =
"Completed";


}



return appointmentObj;



}

);







res.json(updatedAppointments);



}


catch(err){


console.log(err);



res.status(500).json({

message:err.message

});


}



};
// ======================
// Get Doctor Appointments
// ======================


const getDoctorAppointments = async(req,res)=>{


try{


const appointments = await Appointment.find({


doctor:req.params.name


})


.populate(

"patient",

"name email"

)


.sort({

token:1

});





res.json(appointments);



}


catch(err){


console.log(err);



res.status(500).json({

message:err.message

});


}



};








// ======================
// Update Appointment Status
// ======================


const updateAppointmentStatus = async(req,res)=>{


try{


const {status} = req.body;



console.log(
"\n=============================="
);


console.log(
"📌 Update Status Request"
);


console.log(
"Appointment ID:",
req.params.id
);


console.log(
"New Status:",
status
);


console.log(
"=============================="
);





let appointment =

await Appointment.findByIdAndUpdate(


req.params.id,


{

status

},


{

new:true

}


);







if(!appointment){


return res.status(404).json({

message:

"Appointment not found"

});


}







const io = req.app.get("io");






console.log(
"✅ Appointment Updated"
);


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






// ===============================
// Your Turn Notification
// ===============================


if(status === "In Progress"){



console.log(
"🔥 YOUR TURN"
);




if(io){



io.to(

appointment.patient.toString()

)

.emit(

"yourTurn",

{


message:

"Your turn has arrived!",


doctor:

appointment.doctor,


token:

appointment.token,


appointmentId:

appointment._id


}

);



console.log(
"✅ yourTurn emitted"
);



}



}

// ===============================
// Automatic Next Patient
// ===============================


if(

status === "Completed" ||

status === "Cancelled"

){



const nextPatient =

await Appointment.findOne({


doctor:

appointment.doctor,


date:

appointment.date,


status:

"Waiting"


})


.sort({

token:1

});







if(nextPatient){



nextPatient.status =
"In Progress";


await nextPatient.save();






console.log(
"➡️ Next Patient Started"
);


console.log(
"Token:",
nextPatient.token
);






if(io){



io.to(

nextPatient.patient.toString()

)

.emit(

"yourTurn",

{


message:

"Your turn has arrived!",


doctor:

nextPatient.doctor,


token:

nextPatient.token,


appointmentId:

nextPatient._id


}

);



console.log(
"✅ Next Patient Notified"
);



}



}



}








// ===============================
// Update Queue Positions
// ===============================


const waitingAppointments =

await Appointment.find({


doctor:

appointment.doctor,


date:

appointment.date,


status:

"Waiting"


})


.sort({

token:1

});






const today = new Date();


today.setHours(

0,

0,

0,

0

);





const appointmentDate =

new Date(

appointment.date

);



appointmentDate.setHours(

0,

0,

0,

0

);






const queueStarted =

appointmentDate.getTime()

===

today.getTime();







for(

let i=0;

i<waitingAppointments.length;

i++

){



waitingAppointments[i].queuePosition =

i + 1;






if(queueStarted){



waitingAppointments[i].waitingTime =

i * 10;


waitingAppointments[i].queueStarted =

true;


waitingAppointments[i].queueStatus =

"Running";


}

else{


waitingAppointments[i].waitingTime =

null;


waitingAppointments[i].queueStarted =

false;


waitingAppointments[i].queueStatus =

"Scheduled";


}






await waitingAppointments[i].save();



}





console.log(
"✅ Queue Updated"
);

// ===============================
// Notify All Dashboards
// ===============================


if(io){



io.emit(

"statusUpdated",

appointment

);



console.log(
"📢 statusUpdated emitted"
);



}






res.json({


message:

"Status Updated Successfully",


appointment


});





}



catch(err){



console.log(

"❌ Error:",

err

);



res.status(500).json({

message:

err.message

});



}



};








// ======================
// Export Controllers
// ======================


module.exports = {


bookAppointment,


getAppointments,


getPatientAppointments,


getDoctorAppointments,


updateAppointmentStatus


};