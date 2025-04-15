import React from "react";
import { BsTrash3Fill } from "react-icons/bs";

const Message = (props) => {
  return (
    <div className={`flex items-center my-2 ${props.sender ? "justify-end" : "justify-start"}`}>
      {props.sender && (
        <div
          className={`hover:cursor-pointer ${props.sender ? "mr-5" : "ml-5"}`}
          onClick={props.deleteMessage}>
          <BsTrash3Fill className="w-3 h-3" />
        </div>
      )}
      <img
        src={props.profilePicture}
        alt=""
        className={`w-auto h-auto max-w-[5rem] max-h-[5rem] rounded-md ${
          props.sender ? "order-2 mr-2" : "ml-2"
        }`}
      />
      <div
        className={`bg-black text-fuchsia-300 shadow-md shadow-fuchsia-400/50 max-w-[20rem] h-min min-w-[10rem] min-h-[5rem] flex flex-col justify-center rounded-md items-center p-2 text-[0.7rem] ${
          props.sender ? `mr-5` : `ml-5`
        }`}>
        {props.message && <p>{props.message}</p>}
        {props.image && (
          <img
            src={props.image}
            alt="Image"
            className="w-auto h-auto max-w-[10rem] max-h-[10rem] rounded-md"
          />
        )}
      </div>
    </div>
  );
};

export default Message;
