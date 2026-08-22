import { useState } from "react";
import API from "../api/api";

function BookAppointment({ onBookingSuccess }) {

  const [formData, setFormData] = useState({

    doctor: "",

    date: "",

    slot: ""

  });

  const [loading, setLoading] = useState(false);

  const doctors = [

    "Dr. Suri",

    "Dr. Bindu",

    "Dr. Sharma"

  ];

  const slots = [

    "09:00 AM - 09:30 AM",

    "09:30 AM - 10:00 AM",

    "10:00 AM - 10:30 AM",

    "10:30 AM - 11:00 AM",

    "11:00 AM - 11:30 AM",

    "11:30 AM - 12:00 PM",

    "12:00 PM - 12:30 PM",

    "12:30 PM - 01:00 PM",

    "02:00 PM - 02:30 PM",

    "02:30 PM - 03:00 PM",

    "03:00 PM - 03:30 PM",

    "03:30 PM - 04:00 PM",

    "04:00 PM - 04:30 PM",

    "04:30 PM - 05:00 PM"

  ];

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };

  const handleSubmit = async () => {

    if (

      !formData.doctor ||

      !formData.date ||

      !formData.slot

    ) {

      alert("Please fill all fields.");

      return;

    }

    setLoading(true);

    try {

      const user = JSON.parse(

        localStorage.getItem("user")

      );

      const data = {

        patient: user._id,

        doctor: formData.doctor,

        date: formData.date,

        slot: formData.slot

      };

      const response = await API.post(

        "/appointments/book",

        data

      );

      const appointment = response.data.appointment;

      let message = `✅ Appointment Booked Successfully!

Doctor: ${appointment.doctor}
Date: ${appointment.date}
Time Slot: ${appointment.slot}
Token: ${appointment.token}
Status: ${appointment.queueStatus}`;

      if (appointment.queueStarted) {

        message += `

Estimated Waiting Time:
${appointment.waitingTime} minutes`;

      }

      else {

        message += `

Estimated Waiting Time:
Available on appointment day`;

      }

      alert(message);

      setFormData({

        doctor: "",

        date: "",

        slot: ""

      });

      if (onBookingSuccess) {

        onBookingSuccess();

      }

    }

    catch (error) {

      console.log(error);

      alert(

        error.response?.data?.message ||

        "Booking Failed"

      );

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <div className="card shadow-lg border-0 rounded-4 p-4">

      <h3 className="mb-4 text-primary fw-bold">

        📅 Book New Appointment

      </h3>

      <div className="mb-3">

        <label className="form-label fw-semibold">

          Select Doctor

        </label>

        <select

          className="form-select"

          name="doctor"

          value={formData.doctor}

          onChange={handleChange}
 
        >

          <option value="">

            Select Doctor

          </option>

          {

            doctors.map((doctor, index) => (

              <option

                key={index}

                value={doctor}

              >

                {doctor}

              </option>

            ))

          }

        </select>

      </div>

      <div className="mb-3">

        <label className="form-label fw-semibold">

          Appointment Date

        </label>

        <input

          type="date"

          className="form-control"

          name="date"

          value={formData.date}

          min={today}

          onChange={handleChange}

        />

      </div>

      <div className="mb-4">

        <label className="form-label fw-semibold">

          Select Time Slot

        </label>

        <select

          className="form-select"

          name="slot"

          value={formData.slot}

          onChange={handleChange}

        >

          <option value="">

            Select Time Slot

          </option>

          {

            slots.map((slot, index) => (

              <option

                key={index}

                value={slot}

              >

                {slot}

              </option>

            ))

          }

        </select>

      </div>

      <button

        className="btn btn-primary w-100"

        onClick={handleSubmit}

        disabled={loading}

      >

        {

          loading

          ?

          "Booking Appointment..."

          :

          "📌 Book Appointment"

        }

      </button>

    </div>

  );

}

export default BookAppointment;