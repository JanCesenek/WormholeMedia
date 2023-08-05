import React from "react";
import Loading from "./custom/loading";
import classes from "./message.module.scss";
import { api } from "../core/api";
import { useUpdate } from "../hooks/use-update";
import { BsTrash3Fill } from "react-icons/bs";
import { createClient } from "@supabase/supabase-js";
import { supStorageURL, supStorageKEY } from "../core/supabaseStorage";

const Message = (props) => {
  const { isLoading: usersLoading } = useUpdate("/users");
  const { refetch, isLoading: messagesLoading } = useUpdate("/messages");
  const token = localStorage.getItem("token");

  const loading = usersLoading || messagesLoading;

  const supabase = createClient(supStorageURL, supStorageKEY);

  const deleteReq = async () => {
    if (props.image) {
      const { data } = await supabase.storage.from("imgs").list("messages");
      const curFile = data.find((el) => props.image.includes(el.name));
      const { data: deletedData, error: deletedError } = await supabase.storage
        .from("imgs")
        .remove([`messages/${curFile.name}`]);

      if (deletedError) {
        console.log("Could not remove the file...", deletedError);
      } else {
        console.log("File removed successfully!", deletedData);
      }
    }
    await api
      .delete(`/messages/${props.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetch())
      .catch((err) => console.log(`Delete req - ${err}`));
  };

  if (loading) return <Loading font="text-[0.5rem]" icon="w-[1.5rem] h-[1.5rem]" />;

  return (
    <div className={`flex items-center my-2 ${props.sender ? "justify-end" : "justify-start"}`}>
      {props.sender && (
        <div className="hover:cursor-pointer" onClick={deleteReq}>
          <BsTrash3Fill className="w-3 h-3" />
        </div>
      )}
      <img
        src={props.profilePicture}
        alt=""
        className={`w-auto h-auto max-w-[5rem] max-h-[5rem] ${
          props.sender ? "order-2 mr-2" : "ml-2"
        }`}
      />
      <div
        className={`bg-white text-black max-w-[20rem] h-min min-w-[10rem] min-h-[5rem] flex flex-col justify-center items-center p-2 text-[0.7rem] ${
          props.sender
            ? `${classes.bubbleSender} pr-10 ml-2`
            : `${classes.bubbleRecipient} pl-10 mr-2`
        }`}>
        {props.message && <p>{props.message}</p>}
        {props.image && (
          <img
            src={props.image}
            alt="Image"
            className="w-auto h-auto max-w-[10rem] max-h-[10rem]"
          />
        )}
      </div>
    </div>
  );
};

export default Message;
