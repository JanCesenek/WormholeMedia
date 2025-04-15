import React, { useContext } from "react";
import classes from "./notification.module.css";
import { NotificationContext } from "../../context/NotificationContext";

const Notification = ({ message }) => {
  const { status } = useContext(NotificationContext);

  return (
    <div
      className={`fixed top-[2rem] left-1/2 transform -translate-x-1/2 bg-black text-fuchsia-400 rounded-md z-50 shadow-md shadow-fuchsia-400/50 p-5 text-center text-[2rem] ${
        status === "success" ? classes.notificationSuccess : classes.notificationError
      }`}>
      {message}
    </div>
  );
};

export default Notification;
