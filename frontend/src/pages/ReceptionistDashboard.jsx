import React, { useEffect, useState } from "react";
import socket from "../socket";

function ReceptionistDashboard() {

  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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
  // Initial Load + Socket.IO
  // ======================

  useEffect(() => {

    // Initial fetch
    fetchAppointments();

    // Listen when a new appointment is booked
    socket.on("appointmentBooked", () => {

      console.log("📢 New appointment booked");

      fetchAppointments();

    });

    // Listen when appointment status changes
    socket.on("statusUpdated", () => {

      console.log("📢 Appointment status updated");

      fetchAppointments();

    });

    // Cleanup
    return () => {

      socket.off("appointmentBooked");
      socket.off("statusUpdated");

    };

  }, []);

  // ======================
  // Update Status
  // ======================

  const updateStatus = async (id, status) => {

    try {

      await fetch(
        `http://localhost:5000/api/appointments/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      // No need to call fetchAppointments()
      // Socket.IO will update automatically

    } catch (error) {

      console.log(error);

    }

  };

  // ======================
  // Search + Filter
  // ======================

  const filteredAppointments = appointments.filter((appointment) => {

    const matchesSearch =
      appointment.patient?.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All"
        ? true
        : appointment.status === statusFilter;

    return matchesSearch && matchesStatus;

  });

  // ======================
  // Dashboard Cards
  // ======================

  const waiting = appointments.filter(
    (a) => a.status === "Waiting"
  ).length;

  const inProgress = appointments.filter(
    (a) => a.status === "In Progress"
  ).length;

  const completed = appointments.filter(
    (a) => a.status === "Completed"
  ).length;

  return (

    <div className="container mt-5">

      <h2 className="text-success mb-4">
        🏥 Receptionist Dashboard
      </h2>

      {/* Dashboard Cards */}

      <div className="row mb-4">

        <div className="col-md-3">

          <div className="card shadow text-center p-3">

            <h6>Total Appointments</h6>

            <h2>{appointments.length}</h2>

          </div>

        </div>

        <div className="col-md-3">

          <div className="card shadow text-center p-3">

            <h6>Waiting</h6>

            <h2 className="text-warning">
              {waiting}
            </h2>

          </div>

        </div>

        <div className="col-md-3">

          <div className="card shadow text-center p-3">

            <h6>In Progress</h6>

            <h2 className="text-primary">
              {inProgress}
            </h2>

          </div>

        </div>

        <div className="col-md-3">

          <div className="card shadow text-center p-3">

            <h6>Completed</h6>

            <h2 className="text-success">
              {completed}
            </h2>

          </div>

        </div>

      </div>

      {/* Search & Filter */}

      <div className="card shadow p-4">

        <div className="row mb-3">

          <div className="col-md-4">

            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search Patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          <div className="col-md-3">

            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >

              <option value="All">
                All
              </option>

              <option value="Waiting">
                Waiting
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Completed">
                Completed
              </option>

            </select>

          </div>

          <div className="col-md-2">

            <button
              className="btn btn-success w-100"
              onClick={fetchAppointments}
            >
              🔄 Refresh
            </button>

          </div>

        </div>

        {/* Appointment Table */}

        <table className="table table-hover table-bordered text-center align-middle">

          <thead className="table-dark">

            <tr>

              <th>Token</th>

              <th>Patient</th>

              <th>Doctor</th>

              <th>Date</th>

              <th>Status</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {

              filteredAppointments.length > 0 ? (

                filteredAppointments.map((appointment) => (

                  <tr key={appointment._id}>

                    <td>{appointment.token}</td>

                    <td>{appointment.patient?.name}</td>

                    <td>{appointment.doctor}</td>

                    <td>{appointment.date}</td>

                    <td>

                      <span
                        className={`badge rounded-pill px-3 py-2 ${
                          appointment.status === "Waiting"
                            ? "bg-warning text-dark"
                            : appointment.status === "In Progress"
                            ? "bg-primary"
                            : appointment.status === "Completed"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >

                        {appointment.status}

                      </span>

                    </td>

                    <td>

                      <select
                        className="form-select"
                        value={appointment.status}
                        onChange={(e) =>
                          updateStatus(
                            appointment._id,
                            e.target.value
                          )
                        }
                      >

                        <option value="Waiting">
                          Waiting
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="Completed">
                          Completed
                        </option>

                      </select>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="text-center"
                  >

                    No Appointments Found

                  </td>

                </tr>

              )

            }

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default ReceptionistDashboard;