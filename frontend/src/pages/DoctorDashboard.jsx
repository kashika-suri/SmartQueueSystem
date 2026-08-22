import React, { useEffect, useState } from "react";
import socket from "../socket";
import API from "../api/api";

function DoctorDashboard() {

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==============================
  // Get Logged-in Doctor
  // ==============================

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.log("❌ Invalid user data in localStorage");
  }

  const doctor = user?.name;

  // ==============================
  // Fetch Doctor Appointments
  // ==============================

  const fetchAppointments = async () => {

    try {

      if (!doctor) {

        console.log(
          "❌ Doctor name not found in localStorage"
        );

        setAppointments([]);
        setLoading(false);

        return;
      }

      console.log(
        "👨‍⚕️ Fetching appointments for:",
        doctor
      );

      const response = await API.get(
        `/appointments/doctor/${encodeURIComponent(doctor)}`
      );

      console.log(
        "📋 Doctor Appointments:",
        response.data
      );

      setAppointments(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.log(
        "❌ Error fetching doctor appointments:",
        error
      );

      setAppointments([]);

    } finally {

      setLoading(false);

    }

  };

  // ==============================
  // Load Appointments
  // + Socket.IO
  // ==============================

  useEffect(() => {

    fetchAppointments();

    socket.on(
      "statusUpdated",
      fetchAppointments
    );

    socket.on(
      "appointmentBooked",
      fetchAppointments
    );

    return () => {

      socket.off(
        "statusUpdated",
        fetchAppointments
      );

      socket.off(
        "appointmentBooked",
        fetchAppointments
      );

    };

  }, [doctor]);


  // ==============================
  // Update Appointment Status
  // ==============================

  const updateStatus = async (id, status) => {

    try {

      console.log(
        "🔄 Updating appointment:",
        id,
        status
      );

      await API.put(
        `/appointments/${id}/status`,
        {
          status
        }
      );

      // Refresh appointments
      await fetchAppointments();

    } catch (error) {

      console.log(
        "❌ Error updating status:",
        error
      );

    }

  };


  // ==============================
  // Loading
  // ==============================

  if (loading) {

    return (

      <div className="container mt-5">

        <div className="text-center">

          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="mt-3">
            Loading appointments...
          </p>

        </div>

      </div>

    );

  }


  // ==============================
  // UI
  // ==============================

  return (

    <div className="container mt-5">

      {/* ==========================
          Header
      ========================== */}

      <div className="text-center mb-4">

        <h2 className="text-primary fw-bold">

          👨‍⚕️ Doctor Dashboard

        </h2>

        <p className="text-muted mb-0">

          Welcome,{" "}

          <strong>
            {doctor || "Doctor"}
          </strong>

          {" "}👋

        </p>

      </div>


      {/* ==========================
          Doctor Information
      ========================== */}

      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <div className="row text-center">

            <div className="col-md-4">

              <h6 className="text-muted">
                Doctor
              </h6>

              <h5 className="fw-bold">
                {doctor || "N/A"}
              </h5>

            </div>


            <div className="col-md-4">

              <h6 className="text-muted">
                Total Appointments
              </h6>

              <h5 className="fw-bold text-primary">
                {appointments.length}
              </h5>

            </div>


            <div className="col-md-4">

              <h6 className="text-muted">
                Waiting Patients
              </h6>

              <h5 className="fw-bold text-warning">

                {
                  appointments.filter(
                    (appointment) =>
                      appointment.status === "Waiting"
                  ).length
                }

              </h5>

            </div>

          </div>

        </div>

      </div>


      {/* ==========================
          Appointment Table
      ========================== */}

      <div className="card shadow-lg">

        <div className="card-body">

          <h5 className="fw-bold mb-4">

            📋 Today's Appointments

          </h5>


          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-dark">

                <tr>

                  <th>Token</th>

                  <th>Patient</th>

                  <th>Date</th>

                  <th>Time Slot</th>

                  <th>Status</th>

                  <th>Action</th>

                </tr>

              </thead>


              <tbody>

                {

                  appointments.length > 0

                    ?

                    appointments.map(
                      (appointment) => (

                        <tr
                          key={
                            appointment._id
                          }
                        >

                          {/* Token */}

                          <td>

                            <span className="badge bg-primary">

                              #
                              {
                                appointment.token
                              }

                            </span>

                          </td>


                          {/* Patient */}

                          <td>

                            <div>

                              <h6 className="mb-0">

                                {
                                  appointment.patient?.name ||
                                  "Unknown Patient"
                                }

                              </h6>

                              <small className="text-muted">

                                {
                                  appointment.patient?.email ||
                                  ""
                                }

                              </small>

                            </div>

                          </td>


                          {/* Date */}

                          <td>

                            {
                              appointment.date ||
                              "N/A"
                            }

                          </td>


                          {/* Slot */}

                          <td>

                            🕒{" "}

                            {
                              appointment.slot ||
                              "N/A"
                            }

                          </td>


                          {/* Status */}

                          <td>

                            <span

                              className={`
                                badge
                                px-3
                                py-2
                                ${
                                  appointment.status ===
                                  "Waiting"

                                    ? "bg-warning text-dark"

                                    : appointment.status ===
                                      "In Progress"

                                    ? "bg-primary"

                                    : appointment.status ===
                                      "Completed"

                                    ? "bg-success"

                                    : appointment.status ===
                                      "Cancelled"

                                    ? "bg-danger"

                                    : "bg-secondary"
                                }
                              `}

                            >

                              {
                                appointment.status ||
                                "Unknown"
                              }

                            </span>

                          </td>


                          {/* Actions */}

                          <td>

                            {/* Start */}

                            {
                              appointment.status ===
                                "Waiting" && (

                                <button

                                  className="btn btn-primary btn-sm me-2"

                                  onClick={() =>
                                    updateStatus(
                                      appointment._id,
                                      "In Progress"
                                    )
                                  }

                                >

                                  ▶️ Start

                                </button>

                              )
                            }


                            {/* Complete */}

                            {
                              appointment.status ===
                                "In Progress" && (

                                <button

                                  className="btn btn-success btn-sm me-2"

                                  onClick={() =>
                                    updateStatus(
                                      appointment._id,
                                      "Completed"
                                    )
                                  }

                                >

                                  ✅ Complete

                                </button>

                              )
                            }


                            {/* Cancel */}

                            {
                              appointment.status !==
                                "Completed" &&

                              appointment.status !==
                                "Cancelled" && (

                                <button

                                  className="btn btn-danger btn-sm"

                                  onClick={() =>
                                    updateStatus(
                                      appointment._id,
                                      "Cancelled"
                                    )
                                  }

                                >

                                  ❌ Cancel

                                </button>

                              )
                            }

                          </td>

                        </tr>

                      )
                    )

                    :

                    (

                      <tr>

                        <td
                          colSpan="6"
                          className="text-center py-5"
                        >

                          <div>

                            <div
                              style={{
                                fontSize: "40px"
                              }}
                            >
                              📭
                            </div>

                            <h5 className="mt-3">

                              No appointments found

                            </h5>

                            <p className="text-muted mb-0">

                              No patients have booked
                              an appointment with you yet.

                            </p>

                          </div>

                        </td>

                      </tr>

                    )

                }

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );

}

export default DoctorDashboard;