import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookAppointment from "../components/BookAppointment";
import socket from "../socket";
import API from "../api/api";

function PatientDashboard() {

  const [appointments, setAppointments] = useState([]);

  const [notification, setNotification] = useState({

    show: false,

    doctor: "",

    token: "",

    slot: "",

    message: ""

  });

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  const user = JSON.parse(

    localStorage.getItem("user")

  );

  const handleLogout = ()=>{

    localStorage.clear();

    navigate("/login");

  };

  const fetchAppointments = async()=>{

    try{

      const response = await API.get(

        `/appointments/patient/${userId}`

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

    if(!userId) return;

    fetchAppointments();

    const handleConnect = ()=>{

      console.log(

        "🟢 Socket Connected:",

        socket.id

      );

      socket.emit(

        "joinPatientRoom",

        userId

      );

    };

    if(socket.connected){

      handleConnect();

    }

    socket.on(

      "connect",

      handleConnect

    );

    socket.on(

      "appointmentBooked",

      fetchAppointments

    );

    socket.on(

      "statusUpdated",

      fetchAppointments

    );
        socket.on(

      "yourTurn",

      (data)=>{

        fetchAppointments();

        if("speechSynthesis" in window){

          const speech = new SpeechSynthesisUtterance(

            `Attention please. Token number ${data.token}. Please proceed to ${data.doctor}.`

          );

          speech.rate = 1;

          speech.pitch = 1;

          speech.volume = 1;

          window.speechSynthesis.cancel();

          window.speechSynthesis.speak(speech);

        }

        setNotification({

          show:true,

          doctor:data.doctor,

          token:data.token,

          slot:data.slot,

          message:data.message

        });

      }

    );

    return ()=>{

      socket.off(

        "connect",

        handleConnect

      );

      socket.off(

        "appointmentBooked",

        fetchAppointments

      );

      socket.off(

        "statusUpdated",

        fetchAppointments

      );

      socket.off(

        "yourTurn"

      );

    };

  },[userId]);

  const currentAppointment = appointments.find(

    (appointment)=>

      appointment.status==="Waiting" ||

      appointment.status==="In Progress"

  );

  const patientsAhead =

    currentAppointment &&

    currentAppointment.queueStarted &&

    currentAppointment.status==="Waiting"

    ?

    appointments.filter(

      (appointment)=>

        appointment.doctor===currentAppointment.doctor &&

        appointment.date===currentAppointment.date &&

        appointment.slot===currentAppointment.slot &&

        appointment.status==="Waiting" &&

        appointment.token<currentAppointment.token

    ).length

    :

    0;

  const getEstimatedTime = (appointment)=>{

    if(!appointment){

      return "-";

    }

    if(

      !appointment.queueStarted ||

      appointment.waitingTime===null

    ){

      return "Available on appointment day";

    }

    const time = new Date();

    time.setMinutes(

      time.getMinutes() + appointment.waitingTime

    );

    return time.toLocaleTimeString([],{

      hour:"2-digit",

      minute:"2-digit"

    });

  };

  return(

    <div className="container mt-5">
            {

        notification.show && (

          <div

            className="position-fixed top-0 start-50 translate-middle-x mt-4"

            style={{

              zIndex:9999,

              width:"420px"

            }}

          >

            <div className="card shadow-lg border-0 rounded-4">

              <div className="card-header bg-danger text-white text-center">

                <h3 className="mb-0">

                  🔔 YOUR TURN

                </h3>

              </div>

              <div className="card-body text-center">

                <div

                  className="rounded-circle bg-danger text-white mx-auto mb-3 d-flex align-items-center justify-content-center"

                  style={{

                    width:90,

                    height:90,

                    fontSize:"42px"

                  }}

                >

                  👨‍⚕️

                </div>

                <h4 className="fw-bold">

                  {notification.message}

                </h4>

                <hr/>

                <h5>

                  Doctor :

                  <span className="text-primary">

                    {" "}

                    {notification.doctor}

                  </span>

                </h5>

                <h5>

                  Time Slot :

                  <span className="text-success">

                    {" "}

                    {notification.slot}

                  </span>

                </h5>

                <h2 className="text-danger mt-3">

                  Token #{notification.token}

                </h2>

                <button

                  className="btn btn-success mt-3"

                  onClick={()=>setNotification({

                    show:false,

                    doctor:"",

                    token:"",

                    slot:"",

                    message:""

                  })}

                >

                  OK

                </button>

              </div>

            </div>

          </div>

        )

      }

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold">

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

          Logout

        </button>

      </div>

      <div className="row">

        <div className="col-md-3 mb-3">

          <div className="card shadow border-0 rounded-4 text-center p-3 h-100">

            <div style={{fontSize:"40px"}}>

              📅

            </div>

            <h6>Total Appointments</h6>

            <h2 className="fw-bold text-primary">

              {appointments.length}

            </h2>

          </div>

        </div>

        <div className="col-md-3 mb-3">

          <div className="card shadow border-0 rounded-4 text-center p-3 h-100">

            <div style={{fontSize:"40px"}}>

              📋

            </div>

            <h6>Status</h6>

            <h5 className="fw-bold">

              {

                currentAppointment

                ?

                currentAppointment.queueStarted

                ?

                currentAppointment.status

                :

                "Scheduled"

                :

                "No Appointment"

              }

            </h5>

          </div>

        </div>

        <div className="col-md-2 mb-3">

          <div className="card shadow border-0 rounded-4 text-center p-3 h-100">

            <div style={{fontSize:"40px"}}>

              🎫

            </div>

            <h6>Token</h6>

            <h2 className="fw-bold text-danger">

              {

                currentAppointment

                ?

                currentAppointment.token

                :

                "-"

              }

            </h2>

          </div>

        </div>

        <div className="col-md-2 mb-3">

          <div className="card shadow border-0 rounded-4 text-center p-3 h-100">

            <div style={{fontSize:"40px"}}>

              👥

            </div>

            <h6>Patients Ahead</h6>

            <h2 className="fw-bold text-warning">

              {

                currentAppointment?.queueStarted

                ?

                patientsAhead

                :

                "-"

              }

            </h2>

          </div>

        </div>

        <div className="col-md-2 mb-3">

          <div className="card shadow border-0 rounded-4 text-center p-3 h-100">

            <div style={{fontSize:"40px"}}>

              ⏱️

            </div>

            <h6>Estimated</h6>

            <h6 className="fw-bold text-success">

              {getEstimatedTime(currentAppointment)}

            </h6>

          </div>

        </div>

      </div>
            {

        currentAppointment && (

          <div className="card shadow-lg border-0 rounded-4 mt-4">

            <div className="card-header bg-info text-white">

              <h4 className="mb-0">

                📅 Appointment Details

              </h4>

            </div>

            <div className="card-body">

              <div className="row">

                <div className="col-md-3">

                  <strong>Doctor</strong>

                  <p>

                    👨‍⚕️ {currentAppointment.doctor}

                  </p>

                </div>

                <div className="col-md-3">

                  <strong>Date</strong>

                  <p>

                    {currentAppointment.date}

                  </p>

                </div>

                <div className="col-md-3">

                  <strong>Time Slot</strong>

                  <p>

                    🕒 {currentAppointment.slot}

                  </p>

                </div>

                <div className="col-md-3">

                  <strong>Token</strong>

                  <p>

                    #{currentAppointment.token}

                  </p>

                </div>

                <div className="col-md-4">

                  <strong>Queue Status</strong>

                  <p>

                    {

                      currentAppointment.queueStarted

                      ?

                      "Running"

                      :

                      "Not Started"

                    }

                  </p>

                </div>

                <div className="col-md-4">

                  <strong>Estimated Wait</strong>

                  <p>

                    {

                      currentAppointment.queueStarted

                      ?

                      `${currentAppointment.waitingTime ?? 0} mins`

                      :

                      "Available on appointment day"

                    }

                  </p>

                </div>

                <div className="col-md-4">

                  <strong>Patients Ahead</strong>

                  <p>

                    {

                      currentAppointment.queueStarted

                      ?

                      patientsAhead

                      :

                      "-"

                    }

                  </p>

                </div>

              </div>

            </div>

          </div>

        )

      }

      <div className="row mt-4">

        <div className="col-lg-5 mb-4">

          <BookAppointment

            onBookingSuccess={fetchAppointments}

          />

        </div>

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

                      <th>Slot</th>

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

                            🕒 {appointment.slot}

                          </td>

                          <td>

                            <span className="badge bg-primary">

                              #{appointment.token}

                            </span>

                          </td>
                                                    <td>

                            {

                              !appointment.queueStarted

                              ?

                              <span className="text-secondary">

                                Available on appointment day

                              </span>

                              :

                              appointment.status==="Waiting"

                              ?

                              `${appointment.waitingTime ?? 0} mins`

                              :

                              appointment.status==="In Progress"

                              ?

                              <span className="text-primary fw-bold">

                                Your Turn

                              </span>

                              :

                              appointment.status==="Completed"

                              ?

                              <span className="text-success">

                                Completed

                              </span>

                              :

                              <span className="text-danger">

                                Cancelled

                              </span>

                            }

                          </td>

                          <td>

                            <span

                              className={`badge rounded-pill px-3 py-2

                              ${

                                !appointment.queueStarted

                                ?

                                "bg-secondary"

                                :

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

                              {

                                !appointment.queueStarted

                                ?

                                "Scheduled"

                                :

                                appointment.status

                              }

                            </span>

                          </td>

                        </tr>

                      ))

                      :

                      <tr>

                        <td

                          colSpan="6"

                          className="text-center text-muted py-4"

                        >

                          No appointments found.

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