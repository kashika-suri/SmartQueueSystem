import React, { useEffect, useState } from "react";
import socket from "../socket";
import "./QueueBoard.css";

function QueueBoard() {

  const [appointments, setAppointments] = useState([]);
  const [time, setTime] = useState(new Date());
  const [lastToken, setLastToken] = useState(null);

  // ======================
  // Fetch Appointments
  // ======================

  const fetchAppointments = async () => {

    try {

      const response = await fetch(
        "http://localhost:5000/api/appointments"
      );

      const data = await response.json();

      setAppointments(data);

    } catch (error) {

      console.log(error);

    }

  };

  // ======================
  // Live Updates
  // ======================

  useEffect(() => {

    fetchAppointments();

    socket.on("appointmentBooked", fetchAppointments);

    socket.on("statusUpdated", fetchAppointments);

    const interval = setInterval(() => {

      setTime(new Date());

    }, 1000);

    return () => {

      socket.off("appointmentBooked", fetchAppointments);

      socket.off("statusUpdated", fetchAppointments);

      clearInterval(interval);

    };

  }, []);

  // ======================
  // Current Patient
  // ======================

  const currentPatient = appointments.find(
    (a) => a.status === "In Progress"
  );

  // ======================
  // Voice Announcement
  // ======================

  useEffect(() => {

    if (!currentPatient) return;

    if (lastToken === currentPatient.token) return;

    setLastToken(currentPatient.token);

    const speech = new SpeechSynthesisUtterance(
      `Attention please. Token number ${currentPatient.token}. Please proceed to Doctor ${currentPatient.doctor}.`
    );

    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.cancel();

    setTimeout(() => {

      window.speechSynthesis.speak(speech);

    }, 300);

  }, [currentPatient]);

  // ======================
  // Next Patients
  // ======================

  const nextPatients = appointments
    .filter((a) => a.status === "Waiting")
    .sort((a, b) => a.token - b.token)
    .slice(0, 5);

  const waitingCount = appointments.filter(
    (a) => a.status === "Waiting"
  ).length;

  const completedCount = appointments.filter(
    (a) => a.status === "Completed"
  ).length;

  return (

    <div className="container-fluid queue-board">

      {/* ================= Header ================= */}

      <div className="header">

        <div>

          <div className="hospital-name">
            🏥 SMART QUEUE MANAGEMENT
          </div>

          <h5>
            Hospital Display Board
          </h5>

        </div>

        <div className="text-end">

          <div className="live">

            ● LIVE

          </div>

          <div className="clock">

            {time.toLocaleTimeString()}

          </div>

          <small>

            {time.toDateString()}

          </small>

          <br />

          <br />

          <button

            className="btn btn-warning"

            onClick={() => {

              if (!document.fullscreenElement) {

                document.documentElement.requestFullscreen();

              } else {

                document.exitFullscreen();

              }

            }}

          >

            ⛶ Full Screen

          </button>

        </div>

      </div>

      {/* ================= Current Patient ================= */}

      <div

        className="now-serving mx-auto mb-5 shadow-lg"

        style={{ maxWidth: "750px" }}

      >

        <h2 className="text-primary">

          NOW SERVING

        </h2>

        <h3 className="mt-3">

          {

            currentPatient

              ? currentPatient.doctor

              : "No Doctor Available"

          }

        </h3>

        <h1 className="animated-token">

          {

            currentPatient

              ? currentPatient.token

              : "--"

          }

        </h1>

        <h4>

          {

            currentPatient

              ? currentPatient.patient?.name

              : "Waiting..."

          }

        </h4>

      </div>

      {/* ================= Statistics ================= */}

      <div className="row mb-5">

        <div className="col-md-4 mb-3">

          <div className="stats-card">

            <h5>

              Waiting Patients

            </h5>

            <h2>

              {waitingCount}

            </h2>

          </div>

        </div>

        <div className="col-md-4 mb-3">

          <div className="stats-card">

            <h5>

              Completed Today

            </h5>

            <h2>

              {completedCount}

            </h2>

          </div>

        </div>

        <div className="col-md-4 mb-3">

          <div className="stats-card">

            <h5>

              Now Serving

            </h5>

            <h2>

              {

                currentPatient

                  ? currentPatient.token

                  : "--"

              }

            </h2>

          </div>

        </div>

      </div>

      {/* ================= Next Queue ================= */}

      <h2 className="text-center mb-4">

        NEXT TOKENS

      </h2>

      <div className="row justify-content-center">

        {

          nextPatients.map((patient) => (

            <div

              key={patient._id}

              className="col-md-2 mb-4"

            >

              <div className="card next-card shadow">

                <div className="card-body text-center">

                  <h5 className="text-primary">

                    TOKEN

                  </h5>

                  <h1>

                    {patient.token}

                  </h1>

                  <strong>

                    {patient.patient?.name}

                  </strong>

                  <hr />

                  <small>

                    {patient.doctor}

                  </small>

                  <br />

                  <small className="text-success">

                    Waiting : {patient.waitingTime} min

                  </small>

                </div>

              </div>

            </div>

          ))

        }

      </div>

      {/* ================= Footer ================= */}

      <div className="footer text-center">

        <h3>

          🚑 Smart Queue Prediction & Dynamic Appointment Scheduling System

        </h3>

      </div>

    </div>

  );

}

export default QueueBoard;