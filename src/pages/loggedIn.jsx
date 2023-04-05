import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Redirecting route - if a user is logged in, redirect him to profile, otherwise redirect him to the home page

const LoggedIn = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem("token");
    if (loggedIn) navigate("profile");
    else navigate("/");
  }, []);

  return <></>;
};

export default LoggedIn;
