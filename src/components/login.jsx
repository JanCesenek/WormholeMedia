import React, { useState, useEffect } from "react";
import { Form, useNavigate } from "react-router-dom";
import classes from "./login.module.scss";
import Button from "./custom/Button";
import Submitting from "./custom/submitting";
import { api } from "../core/api";

const Login = (props) => {
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

  const logIn = async () => {
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
        navigate(`${username}`);
      })
      .catch((err) => console.log(`Invalid credentials - ${err}`));
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col justify-start items-center">
      <Form className={classes.Form}>
        <div className="w-full flex justify-between">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={usernameValue}
            onChange={(e) => setUsernameValue(e.target.value)}
            className="bg-transparent border border-white"
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
            className="bg-transparent border border-white"
          />
        </div>
        <Button
          title={isSubmitting ? "Logging in..." : "Log In"}
          submit
          classes={
            (usernameValue.length < 6 || password.length < 6 || isSubmitting) &&
            "pointer-events-none opacity-50"
          }
          onClick={logIn}
        />
      </Form>
      {isSubmitting && <Submitting />}
      <p className="mt-5 text-yellow-400 underline hover:cursor-pointer" onClick={props.link}>
        New user? Click here to create an account.
      </p>{" "}
    </div>
  );
};

export default Login;
