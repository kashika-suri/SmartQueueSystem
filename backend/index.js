require("dotenv").config();

console.log("🚀 THIS IS MY INDEX.JS");


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");


// Routes

const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorRoutes = require("./routes/doctorRoutes");



const app = express();

const server = http.createServer(app);




// ======================
// Socket.IO Setup
// ======================


const io = new Server(server, {


  cors: {


    origin: "*",


    methods: [
      "GET",
      "POST",
      "PUT"
    ]


  }


});




// Make Socket available in controllers

app.set(
  "io",
  io
);





// ======================
// Middleware
// ======================


app.use(
  cors()
);


app.use(
  express.json()
);






// ======================
// Routes
// ======================


app.use(
  "/api/auth",
  authRoutes
);


app.use(
  "/api/appointments",
  appointmentRoutes
);


app.use(
  "/api/doctors",
  doctorRoutes
);







// ======================
// Home Route
// ======================


app.get(
  "/",
  (req,res)=>{


    res.send(
      "Smart Queue Backend Running 🚀"
    );


  }

);







// ======================
// MongoDB Connection
// ======================


mongoose
.connect(
  process.env.MONGO_URI
)

.then(()=>{


  console.log(
    "✅ MongoDB Connected"
  );


})

.catch((err)=>{


  console.log(
    "❌ MongoDB Error:",
    err
  );


});







// ======================
// Socket.IO Connection
// ======================


io.on(
"connection",
(socket)=>{


  console.log(
    "🟢 Socket Connected:",
    socket.id
  );





  // ======================
  // Patient Room
  // ======================


  socket.on(
    "joinPatientRoom",
    (patientId)=>{


      socket.join(
        patientId
      );


      console.log(

        `👤 Patient Joined Room: ${patientId}`

      );


    }

  );







  // ======================
  // Doctor Room
  // ======================


  socket.on(
    "joinDoctorRoom",
    (doctorName)=>{


      socket.join(
        doctorName
      );


      console.log(

        `👨‍⚕️ Doctor Joined Room: ${doctorName}`

      );


    }

  );







  // ======================
  // Disconnect
  // ======================


  socket.on(
    "disconnect",
    ()=>{


      console.log(

        "🔴 Socket Disconnected:",
        socket.id

      );


    }

  );



}

);







// ======================
// Server
// ======================


const PORT =
process.env.PORT || 5000;



server.listen(
PORT,
()=>{


  console.log(

    `🚀 Server running on port ${PORT}`

  );


}

);