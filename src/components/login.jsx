import React, { useState, useEffect, useContext } from "react";
import { Form, useNavigate } from "react-router-dom";
import Button from "./custom/Button";
import Submitting from "./custom/submitting";
import { api } from "../core/api";
import { NotificationContext } from "../context/NotificationContext";
import { FaSpaceShuttle } from "react-icons/fa";
import { GiRadioactive } from "react-icons/gi";

const Login = (props) => {
  const { notifyContext, setStatus } = useContext(NotificationContext);

  const [usernameValue, setUsernameValue] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const loggedIn = localStorage.getItem("token");
  const userParams = localStorage.getItem("curUser");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loggedIn && navigate(`${userParams}`);
  }, []);

  const addBearerToken = (token) => {
    if (!token) {
      console.log("Token can't be undefined or null.");
      return;
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logIn = async (e) => {
    e.preventDefault();
    const username = usernameValue[0]?.toUpperCase() + usernameValue?.slice(1).toLowerCase();
    setIsSubmitting(true);
    await api
      .post("/login", {
        username,
        password,
      })
      .then((res) => {
        const token = res.data.token;
        addBearerToken(token);
        localStorage.setItem("curUser", username);
        localStorage.setItem("token", token);
        setIsSubmitting(false);
        navigate(`${username}`);
        setStatus("success");
        setTimeout(() => {
          notifyContext(
            <div className="flex items-center">
              <FaSpaceShuttle className="mr-2" /> <span>Welcome back, {username}!</span>
            </div>,
            "login"
          );
        }, 500);
      })
      .catch((err) => {
        console.log(`Invalid credentials - ${err}`);
        setIsSubmitting(false);
        setStatus("error");
        notifyContext(
          <div className="flex items-center">
            <GiRadioactive className="mr-2" /> <span>Invalid credentials!</span>
          </div>,
          "iris"
        );
      });
  };

  return (
    <div className="flex flex-col justify-start items-center text-[1.5rem] w-[min(40rem,90%)]">
      <div
        className={`flex flex-col justify-start items-center w-full ${isSubmitting && "hidden"}`}>
        <Form className="rounded-lg bg-black/50 p-5 shadow-lg shadow-fuchsia-600/50 mt-10 flex flex-col [&>*]:my-2 w-full">
          <div className="w-full flex justify-between">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={usernameValue}
              onChange={(e) => setUsernameValue(e.target.value)}
              className="bg-transparent ml-5 focus:outline-none rounded-sm shadow-md shadow-fuchsia-600/50"
            />
          </div>
          <div className="w-full flex justify-between">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent ml-5 focus:outline-none rounded-sm shadow-md shadow-fuchsia-600/50"
            />
          </div>
          <Button
            title={isSubmitting ? "Logging in..." : "Log In"}
            submit
            classes={`
            ${
              (usernameValue.length < 6 || password.length < 6 || isSubmitting) &&
              "pointer-events-none opacity-70"
            } self-center
          `}
            onClick={logIn}
          />
        </Form>
        <p className="mt-5 text-fuchsia-600 underline hover:cursor-pointer" onClick={props.link}>
          New user? Click here to create an account.
        </p>
      </div>
      {isSubmitting && <Submitting />}
    </div>
  );
};

export default Login;
