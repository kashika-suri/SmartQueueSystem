import { useEffect, useState } from "react";
import API from "../api/api";

function BookAppointment({ onBookingSuccess }) {
  const [formData, setFormData] = useState({
    doctor: "",
    date: "",
    slot: ""
  });

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);

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

  useEffect(() => {
    const fetchRecommendation = async () => {
      if (!formData.doctor || !formData.date) {
        setRecommendation(null);
        return;
      }

      setRecommendationLoading(true);

      try {
        const response = await API.get("/appointments/recommend-slot", {
          params: {
            doctor: formData.doctor,
            date: formData.date
          }
        });

        setRecommendation(response.data);
      } catch (error) {
        console.log("Recommendation error:", error);
        setRecommendation(null);
      } finally {
        setRecommendationLoading(false);
      }
    };

    fetchRecommendation();
  }, [formData.doctor, formData.date]);

  const handleSubmit = async () => {
    if (!formData.doctor || !formData.date || !formData.slot) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const data = {
        patient: user._id,
        doctor: formData.doctor,
        date: formData.date,
        slot: formData.slot
      };

      const response = await API.post("/appointments/book", data);
      const appointment = response.data.appointment;

      let message = `✅ Appointment Booked Successfully!\n\nDoctor: ${appointment.doctor}\nDate: ${appointment.date}\nTime Slot: ${appointment.slot}\nToken: ${appointment.token}\nStatus: ${appointment.queueStatus}`;

      if (appointment.queueStarted) {
        message += `\n\nEstimated Waiting Time:\n${appointment.waitingTime} minutes`;
      } else {
        message += `\n\nEstimated Waiting Time:\nAvailable on appointment day`;
      }

      alert(message);

      setFormData({
        doctor: "",
        date: "",
        slot: ""
      });

      setRecommendation(null);

      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Booking Failed");
    } finally {
      setLoading(false);
    }
  };

  const recommendedSlot = recommendation?.recommendedSlot?.slot;

  return (
    <div className="card shadow-lg border-0 rounded-4 p-4">
      <h3 className="mb-4 text-primary fw-bold">
        📅 Book New Appointment
      </h3>

      <div className="mb-3">
        <label className="form-label fw-semibold">Select Doctor</label>
        <select
          className="form-select"
          name="doctor"
          value={formData.doctor}
          onChange={handleChange}
        >
          <option value="">Select Doctor</option>
          {doctors.map((doctor, index) => (
            <option key={index} value={doctor}>
              {doctor}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Appointment Date</label>
        <input
          type="date"
          className="form-control"
          name="date"
          value={formData.date}
          min={today}
          onChange={handleChange}
        />
      </div>

      {formData.doctor && formData.date && (
        <div className="alert alert-info border-0 rounded-3 mb-3">
          {recommendationLoading ? (
            <div>🤖 AI is finding the best appointment time...</div>
          ) : recommendation ? (
            <>
              <div className="fw-bold">🤖 AI Recommended Slot</div>
              <div className="fs-5 fw-semibold mt-1">
                ⭐ {recommendation.recommendedSlot.slot}
              </div>
              <div>
                Expected waiting time: <strong>{recommendation.recommendedSlot.predictedWait} minutes</strong>
              </div>
              <small className="text-muted">
                Confidence: {recommendation.confidence} · Based on {recommendation.basedOnAppointments} previous appointments
              </small>
              {recommendation.alternatives?.length > 0 && (
                <div className="mt-2">
                  Other good options: {recommendation.alternatives.map((item) => item.slot).join(" • ")}
                </div>
              )}
            </>
          ) : (
            <div>🤖 AI recommendation will appear here.</div>
          )}
        </div>
      )}

      <div className="mb-4">
        <label className="form-label fw-semibold">Select Time Slot</label>
        <select
          className="form-select"
          name="slot"
          value={formData.slot}
          onChange={handleChange}
        >
          <option value="">Select Time Slot</option>
          {slots.map((slot, index) => (
            <option key={index} value={slot}>
              {slot}{slot === recommendedSlot ? " ⭐ AI Recommended" : ""}
            </option>
          ))}
        </select>
      </div>

      <button
        className="btn btn-primary w-100"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Booking Appointment..." : "📌 Book Appointment"}
      </button>
    </div>
  );
}

export default BookAppointment;
