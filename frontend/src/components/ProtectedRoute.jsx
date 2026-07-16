import React from "react";
import { Navigate } from "react-router-dom";


function ProtectedRoute({ children, role }) {


  const user = JSON.parse(
    localStorage.getItem("user")
  );


  // Not logged in

  if (!user) {

    return <Navigate to="/login" />;

  }



  // Wrong role

  if (user.role !== role) {

    return <Navigate to="/" />;

  }



  return children;


}


export default ProtectedRoute;