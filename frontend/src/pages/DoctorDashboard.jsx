import React, { useEffect, useState } from "react";
import socket from "../socket";

function DoctorDashboard() {


  const [appointments, setAppointments] = useState([]);


  const user = JSON.parse(
    localStorage.getItem("user")
  );


  const doctorName = user?.name;



  // ======================
  // Fetch Doctor Appointments
  // ======================

  const fetchAppointments = async () => {

    try {


      const response = await fetch(

        `https://smartqueuesystem-production.up.railway.app/api/appointments/doctor/${doctorName}`

      );


      const data = await response.json();


      setAppointments(data);



    } catch(error) {

      console.log(error);

    }

  };






  // ======================
  // Update Status
  // ======================


  const updateStatus = async(id,status)=>{


    try{


      const response = await fetch(

        `https://smartqueuesystem-production.up.railway.app/api/appointments/${id}/status`,

        {

          method:"PUT",

          headers:{

            "Content-Type":"application/json"

          },


          body:JSON.stringify({

            status

          })

        }

      );



      const data = await response.json();


      alert(data.message);


      fetchAppointments();



    }

    catch(error){

      console.log(error);

    }


  };






  // ======================
  // Socket.IO
  // ======================


  useEffect(()=>{


    if(doctorName){

      fetchAppointments();

    }



    socket.on(
      "appointmentBooked",
      fetchAppointments
    );



    socket.on(
      "statusUpdated",
      fetchAppointments
    );




    return()=>{


      socket.off(
        "appointmentBooked",
        fetchAppointments
      );


      socket.off(
        "statusUpdated",
        fetchAppointments
      );


    };


  },[doctorName]);




  // ======================
  // Statistics
  // ======================


  const waitingPatients =
    appointments.filter(
      a=>a.status==="Waiting"
    );


  const completedPatients =
    appointments.filter(
      a=>a.status==="Completed"
    );


  const currentPatient =
    appointments.find(
      a=>a.status==="In Progress"
    );


  const nextPatient =
    [...waitingPatients].sort(
      (a,b)=>a.token-b.token
    )[0];
  return (

    <div className="container-fluid bg-light py-4">

      <div className="container">


        {/* ======================
            Header
        ====================== */}


        <div className="text-center mb-5">


          <h1 className="fw-bold display-5 text-primary">

            🩺 Smart Queue Doctor Panel

          </h1>


          <p className="text-muted fs-5">

            Welcome Dr. {doctorName}

          </p>


        </div>





        {/* ======================
            Statistics Cards
        ====================== */}


        <div className="row g-4 mb-5">



          {/* Total Patients */}

          <div className="col-lg-4 col-md-6">


            <div className="card border-0 shadow-lg rounded-4 bg-primary text-white">


              <div className="card-body text-center">


                <div style={{fontSize:"45px"}}>

                  👥

                </div>


                <h6 className="mt-3">

                  Total Patients

                </h6>


                <h2 className="fw-bold">

                  {appointments.length}

                </h2>


              </div>


            </div>


          </div>







          {/* Waiting Patients */}


          <div className="col-lg-4 col-md-6">


            <div className="card border-0 shadow-lg rounded-4 bg-warning">


              <div className="card-body text-center">


                <div style={{fontSize:"45px"}}>

                  ⏳

                </div>


                <h6 className="mt-3">

                  Waiting Patients

                </h6>


                <h2 className="fw-bold">

                  {waitingPatients.length}

                </h2>


              </div>


            </div>


          </div>







          {/* Completed Patients */}


          <div className="col-lg-4 col-md-6">


            <div className="card border-0 shadow-lg rounded-4 bg-success text-white">


              <div className="card-body text-center">


                <div style={{fontSize:"45px"}}>

                  ✅

                </div>


                <h6 className="mt-3">

                  Completed

                </h6>


                <h2 className="fw-bold">

                  {completedPatients.length}

                </h2>


              </div>


            </div>


          </div>



        </div>
                {/* ======================
            Current & Next Patient
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
                    width:"90px",
                    height:"90px",
                    fontSize:"40px"
                  }}
                >

                  👤

                </div>




                <h2 className="fw-bold">

                  {currentPatient.patient?.name}

                </h2>




                <hr />




                <h4>

                  Token #{currentPatient.token}

                </h4>




                <p className="text-muted">

                  Date: {currentPatient.date}

                </p>




                <span className="badge bg-success fs-6">

                  Currently Consulting

                </span>



              </>



              :



              <div className="py-5">


                <h2>

                  😴

                </h2>


                <h5 className="text-muted">

                  No Patient In Progress

                </h5>


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
                    width:"90px",
                    height:"90px",
                    fontSize:"40px"
                  }}
                >

                  ⏳

                </div>




                <h2 className="fw-bold">

                  {nextPatient.patient?.name}

                </h2>




                <hr />




                <h4>

                  Token #{nextPatient.token}

                </h4>




                <p className="text-muted">

                  Date: {nextPatient.date}

                </p>




                <span className="badge bg-warning text-dark fs-6">

                  Waiting

                </span>



              </>



              :



              <div className="py-5">


                <h2>

                  🎉

                </h2>


                <h5 className="text-muted">

                  Queue Empty

                </h5>


              </div>



              }



              </div>


            </div>


          </div>




        </div>
                {/* ======================
            Patient Queue Table
        ====================== */}


        <div className="card border-0 shadow-lg rounded-4 mb-5">


          <div className="card-header bg-dark text-white rounded-top-4">


            <h4 className="mb-0">

              📋 Patient Queue Management

            </h4>


          </div>





          <div className="card-body">



            <div className="table-responsive">



              <table className="table table-hover align-middle">



                <thead className="table-light">


                  <tr>


                    <th>
                      Token
                    </th>


                    <th>
                      Patient
                    </th>


                    <th>
                      Date
                    </th>


                    <th>
                      Status
                    </th>


                    <th>
                      Change Status
                    </th>


                  </tr>


                </thead>





                <tbody>


                {


                appointments.length > 0 ?


                appointments.map((appointment)=>(


                  <tr key={appointment._id}>


                    <td>


                      <span className="badge bg-primary">

                        #{appointment.token}

                      </span>


                    </td>





                    <td>

                      {appointment.patient?.name || "Unknown"}

                    </td>





                    <td>

                      {appointment.date}

                    </td>





                    <td>


                      <span

                      className={`badge ${
                        
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

                      }`}


                      >


                        {appointment.status}


                      </span>


                    </td>







                    <td>


                      <select

                        className="form-select"


                        value={appointment.status}


                        onChange={(e)=>

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



                        <option value="Cancelled">

                          Cancelled

                        </option>



                      </select>


                    </td>




                  </tr>


                ))



                :



                <tr>


                  <td 
                  colSpan="5"
                  className="text-center"
                  >

                    No Patients Today


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


  );


}


export default DoctorDashboard;