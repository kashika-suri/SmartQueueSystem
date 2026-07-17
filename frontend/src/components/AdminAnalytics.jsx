import React, { useEffect, useMemo, useState } from "react";
import socket from "../socket";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function AdminAnalytics() {

  const [appointments, setAppointments] = useState([]);

  // ==========================
  // Fetch Appointments
  // ==========================

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

  // ==========================
  // Live Updates
  // ==========================

  useEffect(() => {

    fetchAppointments();

    socket.on("appointmentBooked", fetchAppointments);

    socket.on("statusUpdated", fetchAppointments);

    return () => {

      socket.off("appointmentBooked", fetchAppointments);

      socket.off("statusUpdated", fetchAppointments);

    };

  }, []);

  // ==========================
  // Statistics
  // ==========================

  const stats = useMemo(() => {

    const total = appointments.length;

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

    const averageWaitingTime =
      total > 0
        ? (
            appointments.reduce(
              (sum, a) => sum + (a.waitingTime || 0),
              0
            ) / total
          ).toFixed(1)
        : 0;

    return {

      total,

      waiting,

      inProgress,

      completed,

      cancelled,

      averageWaitingTime,

    };

  }, [appointments]);
    // ==========================
  // Doctor Workload Chart
  // ==========================

  const doctorWorkload = {};

  appointments.forEach((appointment) => {

    doctorWorkload[appointment.doctor] =
      (doctorWorkload[appointment.doctor] || 0) + 1;

  });

  const barData = {

    labels: Object.keys(doctorWorkload),

    datasets: [

      {

        label: "Appointments",

        data: Object.values(doctorWorkload),

        backgroundColor: [

          "#0d6efd",
          "#198754",
          "#ffc107",
          "#dc3545",
          "#6610f2",
          "#20c997",

        ],

        borderRadius: 8,

      },

    ],

  };



  // ==========================
  // Appointment Status Chart
  // ==========================

  const doughnutData = {

    labels: [

      "Waiting",

      "In Progress",

      "Completed",

      "Cancelled",

    ],

    datasets: [

      {

        data: [

          stats.waiting,

          stats.inProgress,

          stats.completed,

          stats.cancelled,

        ],

        backgroundColor: [

          "#ffc107",

          "#0d6efd",

          "#198754",

          "#dc3545",

        ],

        borderWidth: 1,

      },

    ],

  };



  const chartOptions = {

    responsive: true,

    plugins: {

      legend: {

        position: "bottom",

      },

    },

  };
    return (

    <div className="container mt-4">

      <h2 className="text-center mb-4">
        📊 Hospital Analytics Dashboard
      </h2>

      {/* ==========================
          Statistics Cards
      ========================== */}

      <div className="row g-4">

        <div className="col-md-3">
          <div className="card shadow text-center border-primary">
            <div className="card-body">
              <h6>Total Appointments</h6>
              <h2 className="text-primary">
                {stats.total}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow text-center border-warning">
            <div className="card-body">
              <h6>Waiting</h6>
              <h2 className="text-warning">
                {stats.waiting}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow text-center border-info">
            <div className="card-body">
              <h6>In Progress</h6>
              <h2 className="text-info">
                {stats.inProgress}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow text-center border-success">
            <div className="card-body">
              <h6>Completed</h6>
              <h2 className="text-success">
                {stats.completed}
              </h2>
            </div>
          </div>
        </div>

      </div>

      <div className="row g-4 mt-2">

        <div className="col-md-6">

          <div className="card shadow">

            <div className="card-body">

              <h4 className="text-center mb-3">
                📈 Doctor Workload
              </h4>

              <Bar
                data={barData}
                options={chartOptions}
              />

            </div>

          </div>

        </div>

        <div className="col-md-6">

          <div className="card shadow">

            <div className="card-body">

              <h4 className="text-center mb-3">
                🥧 Appointment Status
              </h4>

              <Doughnut
                data={doughnutData}
                options={chartOptions}
              />

            </div>

          </div>

        </div>

      </div>

      <div className="row mt-4">

        <div className="col-md-6">

          <div className="card shadow">

            <div className="card-body text-center">

              <h5>
                Average Waiting Time
              </h5>

              <h1 className="text-primary">

                {stats.averageWaitingTime} mins

              </h1>

            </div>

          </div>

        </div>

        <div className="col-md-6">

          <div className="card shadow">

            <div className="card-body text-center">

              <h5>
                Cancelled Appointments
              </h5>

              <h1 className="text-danger">

                {stats.cancelled}

              </h1>

            </div>

          </div>

        </div>

      </div>
          </div>

  );

}

export default AdminAnalytics;