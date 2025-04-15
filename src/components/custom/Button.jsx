import React from "react";

const Button = (props) => {
  return (
    <button
      className={`px-5 py-2 bg-black/70 shadow-md shadow-fuchsia-600/50 text-fuchsia-600 ${
        props.classes ? props.classes : undefined
      }`}
      type={props.submit ? "submit" : "button"}
      onClick={props.onClick}
      disabled={props.disabled}>
      {props.title}
    </button>
  );
};

export default Button;
