import React from "react";
import { Outlet } from "react-router-dom";
import MainNavigation from "../components/mainNavigation";

// Root component for the user when logged in

const UserLayout = () => {
  return (
    <div className="flex flex-col mx-0 lg:mx-60 bg-black bg-opacity-70 min-h-screen items-center">
      <MainNavigation />
      <Outlet />
    </div>
  );
};

export default UserLayout;
