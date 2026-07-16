import { useState } from "react";
import API from "../api/api";

function Register() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "patient",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone
    ) {
      alert("Please fill all fields.");
      return;
    }

    try {

      const response = await API.post(
        "/auth/signup",
        formData
      );

      alert(response.data.message);

      // Clear form after successful registration
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "patient",
      });

    } catch (error) {

      if (error.response) {

        alert(error.response.data.message);

      } else {

        alert("Server not responding.");

      }

      console.log(error);

    }

  };

  return (
    <div className="container mt-5">

      <div className="row justify-content-center">

        <div className="col-md-5">

          <div className="card shadow p-4">

            <h2 className="text-center mb-4">
              Register
            </h2>

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <input
              type="email"
              className="form-control mb-3"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="password"
              className="form-control mb-3"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <select
              className="form-select mb-3"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="patient">👤 Patient</option>
              <option value="doctor">👨‍⚕️ Doctor</option>
              <option value="receptionist">🏥 Receptionist</option>
              <option value="admin">👨‍💻 Admin</option>
            </select>

            <button
              className="btn btn-primary w-100"
              onClick={handleSubmit}
            >
              Register
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;