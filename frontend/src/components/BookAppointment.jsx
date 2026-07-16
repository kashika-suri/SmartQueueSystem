import { useState } from "react";
import API from "../api/api";

function BookAppointment({ onBookingSuccess }) {

  const [formData, setFormData] = useState({
    doctor: "",
    date: ""
  });


  const doctors = [
    "Dr. Suri",
    "Dr. Bindu",
    "Dr. Sharma"
  ];


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = async () => {

    try {

      const user = JSON.parse(localStorage.getItem("user"));

      const data = {
        patient: user._id,
        doctor: formData.doctor,
        date: formData.date
      };


      const response = await API.post(
        "/appointments/book",
        data
      );


      alert(response.data.message);


      // clear form
      setFormData({
        doctor:"",
        date:""
      });


      // refresh appointments
      onBookingSuccess();


    } catch(error){

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Booking Failed"
      );

    }

  };


  return (

    <div className="card shadow p-4">

      <h3 className="mb-3">
        Book New Appointment
      </h3>


      <select
        className="form-control mb-3"
        name="doctor"
        value={formData.doctor}
        onChange={handleChange}
      >

        <option value="">
          Select Doctor
        </option>


        {
          doctors.map((doctor,index)=>(
            <option key={index}>
              {doctor}
            </option>
          ))
        }


      </select>


      <input

        type="date"

        className="form-control mb-3"

        name="date"

        value={formData.date}

        onChange={handleChange}

      />


      <button

        className="btn btn-primary"

        onClick={handleSubmit}

      >

        Book Appointment

      </button>


    </div>

  );

}


export default BookAppointment;