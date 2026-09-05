# AI Appointment Slot Recommendation

## What was added
- `backend/services/slotRecommendationService.js`: historical-data recommendation engine.
- `GET /api/appointments/recommend-slot?doctor=Dr.%20Suri&date=YYYY-MM-DD`: returns the best slot, two alternatives, confidence, and historical-data count.
- `frontend/src/components/BookAppointment.jsx`: automatically requests a recommendation after doctor + date are selected and highlights the recommended slot.

## How it works
The recommendation uses historical appointment data for the selected doctor/slot, historical waiting time, current-date slot demand, and historical slot demand. It returns a confidence level based on the amount of historical data.

If there is no history for the doctor, the system uses a clearly labelled cold-start fallback rather than pretending it has learned a pattern.

## Run locally
Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

No new API key is required for this version because the recommendation is generated from the application's own MongoDB data.
