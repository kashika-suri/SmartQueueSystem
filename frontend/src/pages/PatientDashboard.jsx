import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookAppointment from "../components/BookAppointment";
import socket from "../socket";

function PatientDashboard() {

  // ======================
  // States
  // ======================

  const [appointments, setAppointments] = useState([]);

  const [notification, setNotification] = useState({

    show: false,

    doctor: "",

    token: "",

    message: "",

  });

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  const user = JSON.parse(localStorage.getItem("user"));

  // ======================
  // Logout
  // ======================

  const handleLogout = () => {

    localStorage.clear();

    navigate("/login");

  };

  // ======================
  // Fetch Appointments
  // ======================

  const fetchAppointments = async () => {

    try {

      const response = await fetch(

        `https://smartqueuesystem-production.up.railway.app/api/appointments/patient/${userId}`

      );

      const data = await response.json();

      setAppointments(data);

    }

    catch (error) {

      console.log(error);

    }

  };

  // ======================
  // Socket.IO
  // ======================

  useEffect(() => {

    if (!userId) return;

    fetchAppointments();

    const handleConnect = () => {

      console.log("✅ Socket Connected:", socket.id);

      socket.emit("joinPatientRoom", userId);

    };

    if (socket.connected) {

      handleConnect();

    }

    socket.on("connect", handleConnect);

    socket.on("connect_error", (err) => {

      console.log("❌ Socket Error:", err.message);

    });

    socket.on("disconnect", (reason) => {

      console.log("🔴 Socket Disconnected:", reason);

    });

    const handleAppointmentBooked = () => {

      fetchAppointments();

    };

    const handleStatusUpdated = () => {

      fetchAppointments();

    };
        // ======================
    // Your Turn Notification
    // ======================

    const handleYourTurn = (data) => {

      console.log("🚨 YOUR TURN EVENT RECEIVED");

      console.log(data);

      fetchAppointments();

      // Voice Announcement
      if ("speechSynthesis" in window) {

        const speech = new SpeechSynthesisUtterance(

          `Attention please. Token number ${data.token}. Please proceed to Doctor ${data.doctor}.`

        );

        speech.rate = 1;

        speech.pitch = 1;

        speech.volume = 1;

        const voices = window.speechSynthesis.getVoices();

        if (voices.length > 0) {

          speech.voice = voices[0];

        }

        window.speechSynthesis.cancel();

        window.speechSynthesis.speak(speech);

      }

      // Show Notification Card

      setNotification({

        show: true,

        doctor: data.doctor,

        token: data.token,

        message: data.message,

      });

    };

    socket.on(
      "appointmentBooked",
      handleAppointmentBooked
    );

    socket.on(
      "statusUpdated",
      handleStatusUpdated
    );

    socket.on(
      "yourTurn",
      handleYourTurn
    );

    return () => {

      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "appointmentBooked",
        handleAppointmentBooked
      );

      socket.off(
        "statusUpdated",
        handleStatusUpdated
      );

      socket.off(
        "yourTurn",
        handleYourTurn
      );

      socket.off("connect_error");

      socket.off("disconnect");

    };

  }, [userId]);



  // ======================
  // Current Appointment
  // ======================

  const currentAppointment = appointments.find(

    (appointment) =>

      appointment.status === "Waiting" ||

      appointment.status === "In Progress"

  );



  // ======================
  // Patients Ahead
  // ======================

  const patientsAhead =

    currentAppointment &&

    currentAppointment.status === "Waiting"

      ? appointments.filter(

          (appointment) =>

            appointment.status === "Waiting" &&

            appointment.token < currentAppointment.token

        ).length

      : 0;



  // ======================
  // Estimated Time
  // ======================

  const getEstimatedTime = (minutes) => {

    const time = new Date();

    time.setMinutes(

      time.getMinutes() + (minutes || 0)

    );

    return time.toLocaleTimeString([], {

      hour: "2-digit",

      minute: "2-digit",

    });

  };



  return (

    <div className="container mt-5">      {/* ======================
          Notification Popup
      ====================== */}

      {notification.show && (

        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-4"
          style={{
            zIndex: 9999,
            width: "420px",
            animation: "fadeInDown 0.5s ease",
          }}
        >

          <div className="card shadow-lg border-0 rounded-4">

            <div className="card-header bg-danger text-white text-center">

              <h3 className="mb-0">
                🔔 YOUR TURN HAS ARRIVED
              </h3>

            </div>

            <div className="card-body text-center">

              <div
                className="rounded-circle bg-danger text-white mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 90,
                  height: 90,
                  fontSize: "42px",
                }}
              >
                👨‍⚕️
              </div>

              <h4 className="fw-bold">

                {notification.message}

              </h4>

              <hr />

              <h5>

                👨‍⚕️ Doctor:
                <span className="text-primary">
                  {" "}
                  {notification.doctor}
                </span>

              </h5>

              <h2 className="text-danger fw-bold mt-3">

                🎫 Token #{notification.token}

              </h2>

              <p className="text-muted mt-3">

                Please proceed to the doctor's cabin.

              </p>

              <button
                className="btn btn-success px-4"
                onClick={() =>
                  setNotification({
                    ...notification,
                    show: false,
                  })
                }
              >
                OK
              </button>

            </div>

          </div>

        </div>

      )}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2>
            Welcome, {user?.name} 👋
          </h2>

          <p className="text-muted">
            Patient Dashboard
          </p>

        </div>

        <button
          className="btn btn-danger"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </div>

      <div className="row">        {/* Total Appointments */}

        <div className="col-md-3 mb-3">

          <div className="card shadow border-0 rounded-4 text-center p-3 h-100">

            <div style={{ fontSize: "40px" }}>📅</div>

            <h6 className="mt-2">Total Appointments</h6>

            <h2 className="fw-bold text-primary">

              {appointments.length}

            </h2>

          </div>

        </div>



        {/* Current Status */}

        <div className="col-md-3 mb-3">

          <div className="card shadow border-0 rounded-4 text-center p-3 h-100">

            <div style={{ fontSize: "40px" }}>📋</div>

            <h6 className="mt-2">Current Status</h6>

            <h5 className="fw-bold">

              {

                currentAppointment

                  ? currentAppointment.status

                  : "No Active Appointment"

              }

            </h5>

          </div>

        </div>



        {/* My Token */}

        <div className="col-md-2 mb-3">

          <div className="card shadow border-0 rounded-4 text-center p-3 h-100">

            <div style={{ fontSize: "40px" }}>🎫</div>

            <h6 className="mt-2">My Token</h6>

            <h2 className="fw-bold text-danger">

              {

                currentAppointment

                  ? currentAppointment.token

                  : "-"

              }

            </h2>

          </div>

        </div>



        {/* Patients Ahead */}

        <div className="col-md-2 mb-3">

          <div className="card shadow border-0 rounded-4 text-center p-3 h-100">

            <div style={{ fontSize: "40px" }}>👥</div>

            <h6 className="mt-2">Patients Ahead</h6>

            <h2 className="fw-bold text-warning">

              {patientsAhead}

            </h2>

          </div>

        </div>



        {/* Estimated Call */}

        <div className="col-md-2 mb-3">

          <div className="card shadow border-0 rounded-4 text-center p-3 h-100">

            <div style={{ fontSize: "40px" }}>⏱️</div>

            <h6 className="mt-2">Estimated Call</h6>

            <h5 className="fw-bold text-success">

              {

                currentAppointment &&

                currentAppointment.status === "Waiting"

                  ? getEstimatedTime(

                      currentAppointment.waitingTime

                    )

                  : "-"

              }

            </h5>

          </div>

        </div>

      </div>



      <div className="row mt-5">      {/* Book Appointment */}

      <div className="col-lg-5 mb-4">

        <BookAppointment
          onBookingSuccess={fetchAppointments}
        />

      </div>



      {/* Appointment Table */}

      <div className="col-lg-7">

        <div className="card shadow-lg border-0 rounded-4">

          <div className="card-header bg-primary text-white">

            <h4 className="mb-0">

              📋 My Appointments

            </h4>

          </div>

          <div className="card-body">

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-dark">

                  <tr>

                    <th>Doctor</th>

                    <th>Date</th>

                    <th>Token</th>

                    <th>Waiting</th>

                    <th>Status</th>

                  </tr>

                </thead>

                <tbody>

                  {

                    appointments.length > 0

                      ?

                      appointments.map((appointment)=>(

                        <tr key={appointment._id}>

                          <td>

                            👨‍⚕️ {appointment.doctor}

                          </td>

                          <td>

                            {appointment.date}

                          </td>

                          <td>

                            <span className="badge bg-primary">

                              #{appointment.token}

                            </span>

                          </td>

                          <td>

                            {

                              appointment.status==="Waiting"

                              ?

                              `${appointment.waitingTime} min`

                              :

                              "-"

                            }

                          </td>

                          <td>

                            <span

                              className={`badge rounded-pill px-3 py-2

                              ${

                                appointment.status==="Waiting"

                                ?

                                "bg-warning text-dark"

                                :

                                appointment.status==="In Progress"

                                ?

                                "bg-primary"

                                :

                                appointment.status==="Completed"

                                ?

                                "bg-success"

                                :

                                "bg-danger"

                              }

                              `}

                            >

                              {appointment.status}

                            </span>

                          </td>

                        </tr>

                      ))

                      :

                      <tr>

                        <td

                          colSpan="5"

                          className="text-center"

                        >

                          No appointments yet

                        </td>

                      </tr>

                  }

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

    </div>

    {/* Notification Animation */}

    <style>

      {`

      @keyframes fadeInDown{

        from{

          opacity:0;

          transform:translate(-50%,-50px);

        }

        to{

          opacity:1;

          transform:translate(-50%,0);

        }

      }

      `}

    </style>

  </div>

);

}

export default PatientDashboard;