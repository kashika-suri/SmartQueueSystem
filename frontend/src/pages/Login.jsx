import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };


  const handleSubmit = async () => {

    try {

      const response = await API.post("/auth/login", formData);


      alert(response.data.message);


      // Save login details
      localStorage.setItem(
        "token",
        response.data.token
      );


      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );


      // Save user ID for appointments fetching
      localStorage.setItem(
        "userId",
        response.data.user._id
      );


      const role = response.data.user.role;


      // Role based navigation
      if (role === "patient") {

        navigate("/patient");

      }
      else if (role === "doctor") {

        navigate("/doctor");

      }
      else if (role === "receptionist") {

        navigate("/receptionist");

      }
      else if (role === "admin") {

        navigate("/admin");

      }


      console.log(response.data);


    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Login Failed"
      );

    }

  };


  return (

    <div className="container mt-5">

      <div className="row justify-content-center">

        <div className="col-md-5">

          <div className="card shadow p-4">


            <h2 className="text-center mb-4">
              Login
            </h2>


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


            <button

              className="btn btn-primary w-100"

              onClick={handleSubmit}

            >

              Login

            </button>


          </div>

        </div>

      </div>

    </div>

  );

}


export default Login;