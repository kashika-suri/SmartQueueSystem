const Appointment = require("../models/Appointment");

const SLOT_ORDER = [
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

const slotIndex = (slot) => {
  const index = SLOT_ORDER.indexOf(slot);
  return index === -1 ? 0 : index;
};

const getRecommendation = async (doctor, date) => {
  const history = await Appointment.find({
    doctor,
    status: { $ne: "Cancelled" }
  }).lean();

  const requestedDateAppointments = history.filter(
    (appointment) => appointment.date === date
  );

  const results = SLOT_ORDER.map((slot) => {
    const sameSlot = history.filter((appointment) => appointment.slot === slot);
    const sameDoctorSlot = history.filter(
      (appointment) => appointment.doctor === doctor && appointment.slot === slot
    );

    const requestedSlotCount = requestedDateAppointments.filter(
      (appointment) => appointment.slot === slot
    ).length;

    const doctorSlotCount = sameDoctorSlot.length;
    const doctorAverageWaiting = doctorSlotCount
      ? sameDoctorSlot.reduce((sum, item) => sum + (Number(item.waitingTime) || 0), 0) / doctorSlotCount
      : 0;

    const globalAverageWaiting = sameSlot.length
      ? sameSlot.reduce((sum, item) => sum + (Number(item.waitingTime) || 0), 0) / sameSlot.length
      : 0;

    // Intelligent prediction score:
    // historical waiting time is weighted most, then today's demand,
    // then the doctor's historical demand for the same slot.
    const historicalWait = doctorSlotCount > 0
      ? doctorAverageWaiting
      : globalAverageWaiting;

    const demandPenalty = requestedSlotCount * 10;
    const historicalDemandPenalty = Math.min(doctorSlotCount * 1.5, 15);

    const predictedWait = Math.round(
      (historicalWait * 0.65) +
      (demandPenalty * 0.25) +
      (historicalDemandPenalty * 0.10)
    );

    return {
      slot,
      predictedWait,
      bookedAppointments: requestedSlotCount,
      historicalAppointments: doctorSlotCount
    };
  });

  results.sort((a, b) => a.predictedWait - b.predictedWait);

  if (history.length === 0) {
    // Cold-start fallback: with no historical data, prefer a mid-morning slot
    // instead of pretending that the system has learned a pattern.
    const fallback = results.find((item) => item.slot === "11:30 AM - 12:00 PM") || results[0];
    return {
      doctor,
      date,
      recommendedSlot: fallback,
      alternatives: results.filter((item) => item.slot !== fallback.slot).slice(0, 2),
      basedOnAppointments: 0,
      confidence: "Low",
      note: "Not enough historical data yet; recommendation uses a safe default slot."
    };
  }

  return {
    doctor,
    date,
    recommendedSlot: results[0],
    alternatives: results.slice(1, 3),
    basedOnAppointments: history.length,
    confidence: history.length >= 20 ? "High" : history.length >= 8 ? "Medium" : "Low"
  };
};

module.exports = { getRecommendation };
