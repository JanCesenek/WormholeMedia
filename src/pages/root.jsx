import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import { NotificationContext } from "../context/NotificationContext";
import Notification from "../components/custom/notification";

const RootLayout = () => {
  const { notification } = useContext(NotificationContext);

  return (
    <>
      {notification && <Notification message={notification} />}
      <Outlet />
    </>
  );
};

export default RootLayout;
