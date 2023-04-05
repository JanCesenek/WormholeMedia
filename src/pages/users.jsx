import React, { useState } from "react";
import { useUpdate } from "../hooks/use-update";
import { FaUserSecret } from "react-icons/fa";
import { FcVip } from "react-icons/fc";
import Loading from "../components/custom/loading";
import Profile from "./profile";
import { BsTrash3Fill } from "react-icons/bs";
import { api } from "../core/api";

const Users = () => {
  const curUser = localStorage.getItem("curUser");
  const token = localStorage.getItem("token");
  const { data, refetch, isLoading } = useUpdate("/users");
  const { data: friendList } = useUpdate("/friendList");
  const { data: blockList } = useUpdate("/blockList");
  const getUser = data?.find((el) => el.username === curUser);
  const admin = getUser?.admin;
  const [userDetail, setUserDetail] = useState(false);

  const deleteUser = async (id) => {
    if (window.confirm("Really wanna delete another user?")) {
      await api
        .delete(`/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => await refetch())
        .catch((err) => console.log(`Delete req - ${err}`));
    }
  };

  if (isLoading) return <Loading font="text-[2rem]" icon="w-[5rem] h-[5rem]" />;

  return userDetail ? (
    <Profile stranger={userDetail} back={() => setUserDetail(false)} />
  ) : (
    <div className="mt-10 flex flex-col">
      {data?.map((el) => {
        if (el.username !== curUser) {
          const isFriend = friendList?.some(
            (arg) =>
              (arg.firstUser === el.id && arg.secondUser === getUser.id) ||
              (arg.firstUser === getUser.id && arg.secondUser === el.id)
          );
          const isBlocked = blockList?.some(
            (arg) => arg.blocked === el.id && arg.blocker === getUser.id
          );
          const imBlockedBy = blockList?.some(
            (arg) => arg.blocker === el.id && arg.blocked === getUser.id
          );
          const friendsWithAdmin = friendList?.some(
            (arg) =>
              ((arg.firstUser === el.id && arg.secondUser === getUser.id) ||
                (arg.firstUser === getUser.id && arg.secondUser === el.id)) &&
              el.admin
          );
          const hostile = imBlockedBy || (el.admin && !friendsWithAdmin);
          return (
            <div
              key={el.id}
              className={`flex items-center bg-black bg-opacity-70 rounded-md mt-2 p-2 justify-between ${
                isFriend && "text-yellow-400"
              } ${isBlocked && "text-gray-600"} ${hostile && "cursor-not-allowed"}`}>
              <div
                className={`flex items-center rounded-md hover:cursor-pointer [&>*]:mx-2 ${
                  hostile && "pointer-events-none opacity-40"
                }`}
                onClick={() => setUserDetail(el)}>
                {el.admin && <FcVip className="w-10 h-10" />}
                <img
                  src={el.profilePicture}
                  alt="profilePic"
                  className="w-auto h-auto max-w-[5rem] max-h-[5rem]"
                />
                <p>
                  {el.firstName} {el.lastName}
                </p>
              </div>
              {hostile && <FaUserSecret className="text-red-600 ml-5" />}
              {admin && (
                <BsTrash3Fill
                  className="text-red-600 ml-5 hover:cursor-pointer"
                  onClick={() => deleteUser(el.username)}
                />
              )}
            </div>
          );
        }
      })}
    </div>
  );
};

export default Users;
