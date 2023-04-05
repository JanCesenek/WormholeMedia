import React from "react";
import tyjelk from "../../imgs/tealc-coffee.gif";

const Submitting = () => {
  return (
    <div className="flex flex-col items-center mt-8">
      <h1>Oh, well, this is gonna take some time. In the meantime, coffee?</h1>
      <img src={tyjelk} alt="ANO, to je ON" className="w-[30rem] h-[15rem] rounded-[1rem]" />
    </div>
  );
};

export default Submitting;
