import React from "react";
import { FaHourglassHalf } from "react-icons/fa";

const Submitting = () => {
  return (
    <div className="flex flex-col items-center mt-8">
      <div className="flex items-center [&>*]:mx-2 my-5">
        <h1>Travelling through the wormhole...</h1>
        <FaHourglassHalf className="text-[2rem] animate-spin" />
      </div>
      <video
        src="/video/WormholeVideo.mp4"
        width={"50rem"}
        height={"25rem"}
        autoPlay
        loop
        type="video/mp4"
        className="w-[50rem] h-[25rem] rounded-lg bg-black"></video>
    </div>
  );
};

export default Submitting;
