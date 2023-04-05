import React from "react";
import classes from "./Button.module.scss";

const Button = (props) => {
  return (
    <button
      className={`${classes.btn} ${props.classes ? props.classes : undefined}`}
      type={props.submit ? "submit" : "button"}
      onClick={props.onClick}
      disabled={props.disabled}>
      {props.title}
    </button>
  );
};

export default Button;
