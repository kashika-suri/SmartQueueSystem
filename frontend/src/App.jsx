import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import Appointments from "./pages/Appointments";
import QueueBoard from "./pages/QueueBoard";

import ProtectedRoute from "./components/ProtectedRoute";


function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* ======================
            Home
        ====================== */}

        <Route
          path="/"
          element={<Home />}
        />



        {/* ======================
            Authentication
        ====================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        <Route
          path="/register"
          element={<Register />}
        />





        {/* ======================
            Protected Dashboards
        ====================== */}



        {/* Patient */}

        <Route
          path="/patient"
          element={
            <ProtectedRoute role="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />



        {/* Doctor */}

        <Route
          path="/doctor"
          element={
            <ProtectedRoute role="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />



        {/* Receptionist */}

        <Route
          path="/receptionist"
          element={
            <ProtectedRoute role="receptionist">
              <ReceptionistDashboard />
            </ProtectedRoute>
          }
        />



        {/* Admin */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />






        {/* ======================
            Appointment Page
        ====================== */}

        <Route
          path="/appointments"
          element={
            <ProtectedRoute role="patient">
              <Appointments />
            </ProtectedRoute>
          }
        />





        {/* ======================
            Live Queue Board
            (Public Display)
        ====================== */}

        <Route
          path="/queue-board"
          element={<QueueBoard />}
        />



      </Routes>


    </BrowserRouter>

  );

}


export default App;