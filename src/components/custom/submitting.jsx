import React from "react";
import tyjelk from "../../imgs/tealc-coffee.gif";
import { GiCoffeePot } from "react-icons/gi";

const Submitting = () => {
  return (
    <div className="flex flex-col items-center mt-8">
      <h1 className="flex items-center">
        <span>Oh, well, this is gonna take some time. In the meantime, coffee?</span>
        <GiCoffeePot className="ml-2" />
      </h1>
      <img src={tyjelk} alt="ANO, to je ON" className="w-[30rem] h-[15rem] rounded-[1rem]" />
    </div>
  );
};

export default Submitting;
