import { useEffect, useState } from "react";
import API from "../api/api";

function Appointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container mt-5">

      <h2 className="text-center text-primary mb-4">
        📅 All Appointments
      </h2>

      <div className="card shadow">

        <div className="card-body">

          <table className="table table-bordered table-hover">

            <thead className="table-primary">

              <tr>
                <th>Token</th>
                <th>Patient</th>
                <th>Email</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {appointments.map((appointment) => (

                <tr key={appointment._id}>

                  <td>{appointment.token}</td>

                  <td>{appointment.patient?.name}</td>

                  <td>{appointment.patient?.email}</td>

                  <td>{appointment.doctor}</td>

                  <td>{appointment.date}</td>

                  <td>
                    <span
                      className={
                        appointment.status === "Waiting"
                          ? "badge bg-warning text-dark"
                          : "badge bg-success"
                      }
                    >
                      {appointment.status}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Appointments;