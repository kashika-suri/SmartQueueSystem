import React, { useEffect, useState } from "react";
import socket from "../socket";
import API from "../api/api";

function ReceptionistDashboard() {

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

  const updateStatus = async(id,status)=>{

    try{

      await API.put(

        `/appointments/${id}/status`,

        {

          status

        }

      );

      fetchAppointments();

    }

    catch(err){

      console.log(err);

    }

  };

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

        🏥 Receptionist Dashboard

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

            <table className="table table-hover align-middle">

              <thead className="table-dark">

                <tr>

                  <th>Token</th>

                  <th>Patient</th>

                  <th>Doctor</th>

                  <th>Date</th>

                  <th>Time Slot</th>

                  <th>Status</th>

                  <th>Action</th>

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

                      <td>
                                              {

                        appointment.status === "Waiting" && (

                          <button

                            className="btn btn-primary btn-sm me-2"

                            onClick={()=>updateStatus(

                              appointment._id,

                              "In Progress"

                            )}

                          >

                            ▶️ Start

                          </button>

                        )

                      }

                      {

                        appointment.status === "In Progress" && (

                          <button

                            className="btn btn-success btn-sm me-2"

                            onClick={()=>updateStatus(

                              appointment._id,

                              "Completed"

                            )}

                          >

                            ✅ Complete

                          </button>

                        )

                      }

                      {

                        appointment.status !== "Completed" &&

                        appointment.status !== "Cancelled" && (

                          <button

                            className="btn btn-danger btn-sm"

                            onClick={()=>updateStatus(

                              appointment._id,

                              "Cancelled"

                            )}

                          >

                            ❌ Cancel

                          </button>

                        )

                      }

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

export default ReceptionistDashboard;