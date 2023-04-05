import React from "react";
import { GiSpaceship } from "react-icons/gi";

const Loading = (props) => {
  return (
    <div className="flex flex-col items-center mt-20">
      <div className="flex items-center">
        <p className={props.font}>Data is still loading...</p>
        <GiSpaceship className={`animate-bounce ml-5 ${props.icon}`} />
      </div>
    </div>
  );
};

export default Loading;
