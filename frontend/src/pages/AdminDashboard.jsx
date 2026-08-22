import React, { useEffect, useState } from "react";
import socket from "../socket";
import API from "../api/api";

function AdminDashboard() {

  const [appointments, setAppointments] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const fetchAppointments = async()=>{

    try{

      const response = await API.get(

        "/appointments"

      );

      setAppointments(

        response.data

      );

    }

    catch(err){

      console.log(err);

    }

  };

  useEffect(()=>{

    fetchAppointments();

    socket.on(

      "appointmentBooked",

      fetchAppointments

    );

    socket.on(

      "statusUpdated",

      fetchAppointments

    );

    return ()=>{

      socket.off(

        "appointmentBooked",

        fetchAppointments

      );

      socket.off(

        "statusUpdated",

        fetchAppointments

      );

    };

  },[]);

  const filteredAppointments = appointments.filter(

    (appointment)=>{

      const patientName =

        appointment.patient?.name?.toLowerCase() || "";

      const doctorName =

        appointment.doctor.toLowerCase();

      const keyword =

        search.toLowerCase();

      const matchSearch =

        patientName.includes(keyword) ||

        doctorName.includes(keyword);

      const matchStatus =

        statusFilter==="All"

        ||

        appointment.status===statusFilter;

      return matchSearch && matchStatus;

    }

  );

  return(

    <div className="container mt-5">

      <h2 className="text-center text-primary mb-4">

        📊 Admin Dashboard

      </h2>
            <div className="row mb-4">

        <div className="col-md-3">

          <div className="card shadow border-0 text-center">

            <div className="card-body">

              <h6>Total Appointments</h6>

              <h2 className="text-primary">

                {appointments.length}

              </h2>

            </div>

          </div>

        </div>

        <div className="col-md-3">

          <div className="card shadow border-0 text-center">

            <div className="card-body">

              <h6>Waiting</h6>

              <h2 className="text-warning">

                {

                  appointments.filter(

                    appointment=>appointment.status==="Waiting"

                  ).length

                }

              </h2>

            </div>

          </div>

        </div>

        <div className="col-md-3">

          <div className="card shadow border-0 text-center">

            <div className="card-body">

              <h6>In Progress</h6>

              <h2 className="text-primary">

                {

                  appointments.filter(

                    appointment=>appointment.status==="In Progress"

                  ).length

                }

              </h2>

            </div>

          </div>

        </div>

        <div className="col-md-3">

          <div className="card shadow border-0 text-center">

            <div className="card-body">

              <h6>Completed</h6>

              <h2 className="text-success">

                {

                  appointments.filter(

                    appointment=>appointment.status==="Completed"

                  ).length

                }

              </h2>

            </div>

          </div>

        </div>

      </div>

      <div className="card shadow-lg">

        <div className="card-body">

          <div className="row mb-3">

            <div className="col-md-8">

              <input

                type="text"

                className="form-control"

                placeholder="Search Patient or Doctor"

                value={search}

                onChange={(e)=>setSearch(

                  e.target.value

                )}

              />

            </div>

            <div className="col-md-4">

              <select

                className="form-select"

                value={statusFilter}

                onChange={(e)=>setStatusFilter(

                  e.target.value

                )}

              >

                <option value="All">

                  All Status

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

                <option value="Cancelled">

                  Cancelled

                </option>

              </select>

            </div>

          </div>

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-dark">

                <tr>

                  <th>Token</th>

                  <th>Patient</th>

                  <th>Doctor</th>

                  <th>Date</th>

                  <th>Time Slot</th>

                  <th>Status</th>

                </tr>

              </thead>

              <tbody>
                              {

                filteredAppointments.length > 0

                ?

                filteredAppointments.map((appointment)=>(

                  <tr key={appointment._id}>

                    <td>

                      <span className="badge bg-primary">

                        #{appointment.token}

                      </span>

                    </td>

                    <td>

                      <div>

                        <h6 className="mb-0">

                          {appointment.patient?.name}

                        </h6>

                        <small className="text-muted">

                          {appointment.patient?.email}

                        </small>

                      </div>

                    </td>

                    <td>

                      👨‍⚕️ {appointment.doctor}

                    </td>

                    <td>

                      {appointment.date}

                    </td>

                    <td>

                      🕒 {appointment.slot}

                    </td>

                    <td>

                      <span

                        className={`badge px-3 py-2

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

                    colSpan="6"

                    className="text-center text-muted py-5"

                  >

                    <h5>

                      No Appointments Found

                    </h5>

                  </td>

                </tr>

              }
                            </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );

}

export default AdminDashboard;