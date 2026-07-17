import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import AdminAnalytics from "../components/AdminAnalytics";
import ExportReport from "../components/ExportReport";

function AdminDashboard() {

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const navigate = useNavigate();

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
        "https://smartqueuesystem-production.up.railway.app/api/appointments"
      );

      const data = await response.json();

      setAppointments(data);

    } catch (error) {

      console.log(error);

    }

  };

  // ======================
  // Fetch Doctors
  // ======================

  const fetchDoctors = async () => {

    try {

      const response = await fetch(
        "https://smartqueuesystem-production.up.railway.app/api/doctors"
      );

      const data = await response.json();

      setDoctors(data);

    } catch (error) {

      console.log(error);

    }

  };

  // ======================
  // Fetch Patients
  // ======================

  const fetchPatients = async () => {

    try {

      const response = await fetch(
        "https://smartqueuesystem-production.up.railway.app/api/auth/patients"
      );

      const data = await response.json();

      setPatients(data);

    } catch (error) {

      console.log(error);

    }

  };

  // ======================
  // Live Updates
  // ======================

  useEffect(() => {

    fetchAppointments();
    fetchDoctors();
    fetchPatients();

    const refreshDashboard = () => {

      fetchAppointments();

    };

    socket.on("appointmentBooked", refreshDashboard);
    socket.on("statusUpdated", refreshDashboard);

    return () => {

      socket.off("appointmentBooked", refreshDashboard);
      socket.off("statusUpdated", refreshDashboard);

    };

  }, []);

  // ======================
  // Statistics
  // ======================

  const waiting = appointments.filter(
    a => a.status === "Waiting"
  ).length;

  const inProgress = appointments.filter(
    a => a.status === "In Progress"
  ).length;

  const completed = appointments.filter(
    a => a.status === "Completed"
  ).length;

  const cancelled = appointments.filter(
    a => a.status === "Cancelled"
  ).length;

  const currentPatient = appointments.find(
    a => a.status === "In Progress"
  );

  const nextPatient = appointments
    .filter(a => a.status === "Waiting")
    .sort((a, b) => a.token - b.token)[0];

  const averageWaiting =
    appointments.length > 0
      ? Math.round(
          appointments.reduce(
            (sum, a) => sum + (a.waitingTime || 0),
            0
          ) / appointments.length
        )
      : 0;

  return (

    <div className="container-fluid bg-light py-4">

      <div className="container">

        {/* ======================
            Header
        ====================== */}

        <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap">

          <div>

            <h1 className="fw-bold display-5">
              🏥 Smart Queue Management
            </h1>

            <p className="text-muted fs-5">
              Hospital Administration Dashboard
            </p>

          </div>

          <div className="d-flex">

            <ExportReport
              doctors={doctors.length}
              patients={patients.length}
              appointments={appointments.length}
              waiting={waiting}
              inProgress={inProgress}
              completed={completed}
              cancelled={cancelled}
              averageWaiting={averageWaiting}
            />

            <button
              className="btn btn-outline-danger ms-2"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>

          </div>

        </div>

        <AdminAnalytics />

        {/* ======================
            Dashboard Cards
        ====================== */}
        <div className="row g-4 mb-5">

  {/* Doctors */}

  <div className="col-lg-3 col-md-6">

    <div className="card border-0 shadow-lg rounded-4 bg-primary text-white h-100">

      <div className="card-body text-center">

        <div style={{ fontSize: "45px" }}>
          👨‍⚕️
        </div>

        <h6 className="mt-3">
          Doctors
        </h6>

        <h2 className="fw-bold">
          {doctors.length}
        </h2>

      </div>

    </div>

  </div>

  {/* Patients */}

  <div className="col-lg-3 col-md-6">

    <div className="card border-0 shadow-lg rounded-4 bg-success text-white h-100">

      <div className="card-body text-center">

        <div style={{ fontSize: "45px" }}>
          🧑
        </div>

        <h6 className="mt-3">
          Patients
        </h6>

        <h2 className="fw-bold">
          {patients.length}
        </h2>

      </div>

    </div>

  </div>

  {/* Appointments */}

  <div className="col-lg-3 col-md-6">

    <div className="card border-0 shadow-lg rounded-4 bg-warning h-100">

      <div className="card-body text-center">

        <div style={{ fontSize: "45px" }}>
          📅
        </div>

        <h6 className="mt-3">
          Appointments
        </h6>

        <h2 className="fw-bold">
          {appointments.length}
        </h2>

      </div>

    </div>

  </div>

  {/* Waiting */}

  <div className="col-lg-3 col-md-6">

    <div className="card border-0 shadow-lg rounded-4 bg-danger text-white h-100">

      <div className="card-body text-center">

        <div style={{ fontSize: "45px" }}>
          ⏳
        </div>

        <h6 className="mt-3">
          Waiting
        </h6>

        <h2 className="fw-bold">
          {waiting}
        </h2>

      </div>

    </div>

  </div>

  {/* In Progress */}

  <div className="col-lg-3 col-md-6">

    <div className="card border-0 shadow rounded-4 h-100">

      <div className="card-body text-center">

        <div style={{ fontSize: "45px" }}>
          🩺
        </div>

        <h6 className="mt-3">
          In Progress
        </h6>

        <h2 className="text-primary fw-bold">
          {inProgress}
        </h2>

      </div>

    </div>

  </div>

  {/* Completed */}

  <div className="col-lg-3 col-md-6">

    <div className="card border-0 shadow rounded-4 h-100">

      <div className="card-body text-center">

        <div style={{ fontSize: "45px" }}>
          ✅
        </div>

        <h6 className="mt-3">
          Completed
        </h6>

        <h2 className="text-success fw-bold">
          {completed}
        </h2>

      </div>

    </div>

  </div>

  {/* Cancelled */}

  <div className="col-lg-3 col-md-6">

    <div className="card border-0 shadow rounded-4 h-100">

      <div className="card-body text-center">

        <div style={{ fontSize: "45px" }}>
          ❌
        </div>

        <h6 className="mt-3">
          Cancelled
        </h6>

        <h2 className="text-danger fw-bold">
          {cancelled}
        </h2>

      </div>

    </div>

  </div>

  {/* Average Waiting */}

  <div className="col-lg-3 col-md-6">

    <div className="card border-0 shadow rounded-4 h-100">

      <div className="card-body text-center">

        <div style={{ fontSize: "45px" }}>
          ⏱️
        </div>

        <h6 className="mt-3">
          Avg Waiting
        </h6>

        <h2 className="text-warning fw-bold">
          {averageWaiting} min
        </h2>

      </div>

    </div>

  </div>

</div>

{/* ======================
    Live Queue Status
====================== */}

<div className="row g-4 mb-5">

  {/* Current Patient */}

  <div className="col-lg-6">

    <div className="card border-0 shadow-lg rounded-4 h-100">

      <div className="card-header bg-success text-white rounded-top-4">

        <h4 className="mb-0">
          🩺 Current Patient
        </h4>

      </div>

      <div className="card-body text-center">

        {

          currentPatient ?

          <>

            <div
              className="rounded-circle bg-success text-white mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: 90,
                height: 90,
                fontSize: "40px"
              }}
            >

              👤

            </div>

            <h2 className="fw-bold">
              {currentPatient.patient?.name}
            </h2>

            <hr />

            <h5>
              👨‍⚕️ {currentPatient.doctor}
            </h5>

            <h3 className="text-danger mt-3">
              Token #{currentPatient.token}
            </h3>

            <span className="badge bg-success fs-6 mt-3">
              Currently Being Served
            </span>

          </>

          :

          <div className="py-5">

            <h2>😴</h2>

            <h4 className="text-muted">
              No Patient Being Served
            </h4>

          </div>

        }

      </div>

    </div>

  </div>

  {/* Next Patient */}

  <div className="col-lg-6">

    <div className="card border-0 shadow-lg rounded-4 h-100">

      <div className="card-header bg-warning rounded-top-4">

        <h4 className="mb-0">
          ⏭ Next Patient
        </h4>

      </div>

      <div className="card-body text-center">

        {

          nextPatient ?

          <>

            <div
              className="rounded-circle bg-warning mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: 90,
                height: 90,
                fontSize: "40px"
              }}
            >

              ⏳

            </div>

            <h2 className="fw-bold">
              {nextPatient.patient?.name}
            </h2>

            <hr />

            <h5>
              👨‍⚕️ {nextPatient.doctor}
            </h5>

            <h3 className="text-primary mt-3">
              Token #{nextPatient.token}
            </h3>

            <span className="badge bg-warning text-dark fs-6 mt-3">
              Waiting
            </span>

          </>

          :

          <div className="py-5">

            <h2>🎉</h2>

            <h4 className="text-muted">
              Queue Empty
            </h4>

          </div>

        }

      </div>

    </div>

  </div>

</div>
{/* ======================
    Appointment Management
====================== */}

<div className="card border-0 shadow-lg rounded-4 mb-5">

  <div className="card-header bg-dark text-white rounded-top-4">

    <h4 className="mb-0">
      📋 Appointment Management
    </h4>

  </div>

  <div className="card-body">

    <div className="table-responsive">

      <table className="table table-hover align-middle">

        <thead className="table-light">

          <tr>

            <th>Queue</th>

            <th>Token</th>

            <th>Patient</th>

            <th>Doctor</th>

            <th>Date</th>

            <th>Status</th>

            <th>Waiting Time</th>

          </tr>

        </thead>

        <tbody>

          {

            appointments.length > 0 ?

            appointments.map((appointment) => (

              <tr key={appointment._id}>

                <td>

                  <span className="badge bg-secondary">

                    {appointment.queuePosition}

                  </span>

                </td>

                <td>

                  <span className="badge bg-primary">

                    #{appointment.token}

                  </span>

                </td>

                <td>

                  {appointment.patient?.name || "Unknown"}

                </td>

                <td>

                  {appointment.doctor}

                </td>

                <td>

                  {appointment.date}

                </td>

                <td>

                  {

                    appointment.status === "Waiting" &&

                    <span className="badge bg-warning text-dark">

                      Waiting

                    </span>

                  }

                  {

                    appointment.status === "In Progress" &&

                    <span className="badge bg-success">

                      In Progress

                    </span>

                  }

                  {

                    appointment.status === "Completed" &&

                    <span className="badge bg-primary">

                      Completed

                    </span>

                  }

                  {

                    appointment.status === "Cancelled" &&

                    <span className="badge bg-danger">

                      Cancelled

                    </span>

                  }

                </td>

                <td>

                  {appointment.waitingTime || 0} min

                </td>

              </tr>

            ))

            :

            <tr>

              <td
                colSpan="7"
                className="text-center"
              >

                No Appointments Found

              </td>

            </tr>

          }

        </tbody>

      </table>

    </div>

  </div>

</div>
{/* ======================
    Doctor Overview
====================== */}

<div className="card border-0 shadow-lg rounded-4 mb-5">

  <div className="card-header bg-primary text-white rounded-top-4">

    <h4 className="mb-0">
      👨‍⚕️ Doctor Overview
    </h4>

  </div>

  <div className="card-body">

    <div className="row g-4">

      {

        doctors.map((doctor) => {

          const totalAppointments = appointments.filter(
            (a) => a.doctor === doctor.name
          ).length;

          const activeAppointments = appointments.filter(
            (a) =>
              a.doctor === doctor.name &&
              a.status === "In Progress"
          ).length;

          const waitingAppointments = appointments.filter(
            (a) =>
              a.doctor === doctor.name &&
              a.status === "Waiting"
          ).length;

          return (

            <div
              className="col-lg-4 col-md-6"
              key={doctor._id}
            >

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body text-center">

                  <div style={{ fontSize: "50px" }}>
                    👨‍⚕️
                  </div>

                  <h5 className="fw-bold">
                    {doctor.name}
                  </h5>

                  <p className="text-muted">

                    {doctor.specialization || "General Physician"}

                  </p>

                  <hr />

                  <div className="row">

                    <div className="col-4">

                      <h6 className="text-primary">
                        {totalAppointments}
                      </h6>

                      <small>Total</small>

                    </div>

                    <div className="col-4">

                      <h6 className="text-success">
                        {activeAppointments}
                      </h6>

                      <small>Serving</small>

                    </div>

                    <div className="col-4">

                      <h6 className="text-warning">
                        {waitingAppointments}
                      </h6>

                      <small>Waiting</small>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          );

        })

      }

    </div>

  </div>

</div>

{/* ======================
    Patient Overview
====================== */}

<div className="card border-0 shadow-lg rounded-4 mb-5">

  <div className="card-header bg-success text-white rounded-top-4">

    <h4 className="mb-0">
      🧑 Registered Patients
    </h4>

  </div>

  <div className="card-body">

    <div className="row g-4">

      {

        patients.map((patient) => {

          const totalAppointments = appointments.filter(
            (a) => a.patient?._id === patient._id
          ).length;

          return (

            <div
              className="col-lg-3 col-md-6"
              key={patient._id}
            >

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body text-center">

                  <div style={{ fontSize: "45px" }}>
                    🧑
                  </div>

                  <h6 className="fw-bold mt-2">
                    {patient.name}
                  </h6>

                  <p className="text-muted small">

                    {patient.email}

                  </p>

                  <hr />

                  <h5 className="text-primary">

                    {totalAppointments}

                  </h5>

                  <small>

                    Total Appointments

                  </small>

                </div>

              </div>

            </div>

          );

        })

      }

    </div>

  </div>

</div>
      </div>

    </div>

  );

}

export default AdminDashboard;