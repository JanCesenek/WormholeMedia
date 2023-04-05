import React from "react";
import { api } from "../core/api";
import { useUpdate } from "../hooks/use-update";
import { BsBackspaceFill } from "react-icons/bs";
import Loading from "./custom/loading";
import { createClient } from "@supabase/supabase-js";
import { supStorageURL, supStorageKEY } from "../core/supabaseStorage";

const Comment = (props) => {
  const curUsername = localStorage.getItem("curUser");
  const { data: userList, isLoading: usersLoading } = useUpdate("/users");
  const { refetch, isLoading: commentsLoading } = useUpdate("/comments");
  const curUser = userList.find((el) => el.username === curUsername);
  const admin = curUser?.admin;
  const token = localStorage.getItem("token");

  const loading = usersLoading || commentsLoading;

  const supabase = createClient(supStorageURL, supStorageKEY);

  const deleteReq = async () => {
    if (props.image) {
      const { data } = await supabase.storage.from("imgs").list("comments");
      const curFile = data.find((el) => props.image.includes(el.name));
      const { data: deletedData, error: deletedError } = await supabase.storage
        .from("imgs")
        .remove([`comments/${curFile.name}`]);
      if (deletedError) {
        console.log("Could not remove file...", deletedError);
      } else {
        console.log("File removed successfully!", deletedData);
      }
    }
    await api
      .delete(`/comments/${props.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetch())
      .catch((err) => console.log(`Delete req err - ${err}`));
  };

  if (loading) return <Loading font="text-[0.8rem]" icon="w-[2rem] h-[2rem]" />;

  return (
    <div className="flex justify-start items-center mt-2 border-t border-gray-700 text-xs py-2 min-w-[35rem]">
      <div className="flex items-center">
        <img
          src={props.profilePicture}
          alt="profilePic"
          className="w-auto h-auto max-w-[3rem] max-h-[3rem] mr-2"
        />
        <div className="text-yellow-600">
          {props.firstName} {props.lastName}
        </div>
      </div>
      <div className="ml-10 flex flex-col">
        {props.image !== "NULL" && props.image !== "" && (
          <img
            src={props.image}
            className="w-auto h-auto max-w-[10rem] max-h-[10rem] col-span-full"
          />
        )}
        {props.message !== "NULL" && props.message !== "" && (
          <div className="col-span-full text-[0.8rem]">{props.message}</div>
        )}
      </div>
      {(props.userID === curUser.id || admin) && (
        <div className="ml-10 hover:cursor-pointer" onClick={deleteReq}>
          <BsBackspaceFill className="w-3 h-3" />
        </div>
      )}
    </div>
  );
};

export default Comment;
