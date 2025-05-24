import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import { NotificationContext } from "../context/NotificationContext";
import Notification from "../components/custom/notification";
import { FaCopyright } from "react-icons/fa";
import logo from "../imgs/flamebulb.svg";

const RootLayout = () => {
  const { notification } = useContext(NotificationContext);

  return (
    <>
      {notification && <Notification message={notification} />}
      <Outlet />
      <div className="w-full h-[2rem] bg-black flex justify-center items-center text-[0.8rem] mt-20">
        <FaCopyright className=" mr-2" />
        <div className="flex items-center">
          <p className="mr-2">|</p>
          <img src={logo} alt="logo" className="w-[0.8rem]" />
          <p className="ml-2">Jan Cesenek 2025 | All rights reserved</p>
        </div>
      </div>
    </>
  );
};

export default RootLayout;
