import React, { useEffect, useState } from "react";
import socket from "../socket";
import API from "../api/api";

function Appointments() {

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

      const patient =

        appointment.patient?.name?.toLowerCase() || "";

      const doctor =

        appointment.doctor.toLowerCase();

      const keyword =

        search.toLowerCase();

      const matchSearch =

        patient.includes(keyword) ||

        doctor.includes(keyword);

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

        📅 All Appointments

      </h2>
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

            <table className="table table-bordered table-hover align-middle">

              <thead className="table-primary">

                <tr>

                  <th>Token</th>

                  <th>Patient</th>

                  <th>Email</th>

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

                        {appointment.patient?.name}

                      </td>

                      <td>

                        {appointment.patient?.email}

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

                          className={`badge

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

                      colSpan="7"

                      className="text-center text-muted py-4"

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

    </div>

  );

}

export default Appointments;