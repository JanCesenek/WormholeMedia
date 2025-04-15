import React, { createContext, useState } from "react";
import AsgardBeam from "../audio/AsgardBeam.mp3";
import SGCAlarm from "../audio/SGCAlarm.mp3";
import GateClose from "../audio/GateClose.mp3";
import GateOpen from "../audio/GateOpen.mp3";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(false);
  const [status, setStatus] = useState("success");

  const notifyContext = (msg, state) => {
    if (state === "success") {
      const audio = new Audio(AsgardBeam);
      audio.play();
    } else if (state === "error") {
      const audio = new Audio(SGCAlarm);
      audio.play();
    } else if (state === "logout") {
      const audio = new Audio(GateClose);
      audio.play();
    } else if (state === "login") {
      const audio = new Audio(GateOpen);
      audio.play();
    }
    setNotification(msg);
    setTimeout(() => {
      setNotification(false);
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ notification, status, setStatus, notifyContext }}>
      {children}
    </NotificationContext.Provider>
  );
};
