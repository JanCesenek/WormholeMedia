import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../core/api";
import { GiCircleSparks } from "react-icons/gi";
import { useUpdate } from "../hooks/use-update";

const MainNavigation = () => {
  const navigate = useNavigate();
  const { data: usersData } = useUpdate("/users");
  const { data: messagesData } = useUpdate("/messages");
  const { data: requestsData, refetch } = useUpdate("/friendRequests");
  const curUsername = localStorage.getItem("curUser");
  const curUser = usersData?.find((el) => el.username === curUsername);
  const pendingRequests = requestsData?.find((el) => el.recipient === curUser.id);
  const unreadMessages = messagesData?.find((el) => el.recipientID === curUser.id && !el.read);

  useEffect(() => {
    const refetchPendingReq = async () => {
      await refetch();
    };
    refetchPendingReq();
  }, [pendingRequests]);

  const removeBearerToken = () => {
    delete api.defaults.headers.common["Authorization"];
  };

  const logOut = (e) => {
    if (window.confirm("Are you sure you wanna log out?")) {
      removeBearerToken();
      localStorage.clear();
      navigate("/");
    } else e.preventDefault();
  };

  return (
    <nav className="flex justify-around w-full mt-4">
      <NavLink
        className={({ isActive }) => (isActive ? "underline text-yellow-500 flex" : "flex")}
        to={"profile"}
        end>
        Profile
        {pendingRequests && <GiCircleSparks className="w-3 h-3 text-yellow-400 animate-pulse" />}
      </NavLink>
      <NavLink
        className={({ isActive }) => (isActive ? "underline text-yellow-500" : undefined)}
        to={"news-feed"}>
        News Feed
      </NavLink>
      <NavLink
        className={({ isActive }) => (isActive ? "underline text-yellow-500" : undefined)}
        to={"users"}>
        Users
      </NavLink>
      <NavLink
        className={({ isActive }) => (isActive ? "underline text-yellow-500 flex" : "flex")}
        to={"messages"}>
        Messages
        {unreadMessages && <GiCircleSparks className="w-3 h-3 text-yellow-400 animate-pulse" />}
      </NavLink>
      <NavLink className="border border-white rounded-md px-1" to={"/"} onClick={logOut}>
        Log out
      </NavLink>
    </nav>
  );
};

export default MainNavigation;
