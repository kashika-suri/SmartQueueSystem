import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            🏥 Smart Queue
          </Link>

          <div>
            <Link to="/login" className="btn btn-light me-2">
              Login
            </Link>

            <Link to="/register" className="btn btn-warning">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container text-center py-5">
        <h1 className="display-3 fw-bold text-primary">
          Smart Queue Prediction
        </h1>

        <p className="lead">
          Predict • Schedule • Save Time
        </p>

        <button className="btn btn-primary btn-lg mt-3">
          Book Appointment
        </button>
      </div>

      {/* Features */}
      <div className="container my-5">
        <h2 className="text-center mb-4">Why Choose Us?</h2>

        <div className="row g-4">
          <div className="col-md-3">
            <div className="card shadow text-center p-3">
              <h4>📅</h4>
              <h5>Online Booking</h5>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow text-center p-3">
              <h4>🎟️</h4>
              <h5>Digital Token</h5>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow text-center p-3">
              <h4>⏳</h4>
              <h5>Waiting Time</h5>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow text-center p-3">
              <h4>🔴</h4>
              <h5>Live Queue</h5>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center p-3 mt-5">
        © 2026 Smart Queue Prediction System
      </footer>
    </>
  );
}

export default Home;