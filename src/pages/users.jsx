import React, { useState } from "react";
import { useUpdate } from "../hooks/use-update";
import { FaUserSecret } from "react-icons/fa";
import { FcVip } from "react-icons/fc";
import Loading from "../components/custom/loading";
import Profile from "./profile";
import { BsTrash3Fill } from "react-icons/bs";
import { api } from "../core/api";
import Button from "../components/custom/Button";

const Users = () => {
  const curUser = localStorage.getItem("curUser");
  const token = localStorage.getItem("token");
  const { data, refetch, isLoading } = useUpdate("/users");
  const { data: friendList } = useUpdate("/friendList");
  const { data: blockList } = useUpdate("/blockList");
  const getUser = data?.find((el) => el.username === curUser);
  const admin = getUser?.admin;
  const [userDetail, setUserDetail] = useState(false);
  const [findUsers, setFindUsers] = useState("");
  const [toggleFind, setToggleFind] = useState(false);

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
      <p className="my-5 text-fuchsia-400">Total users on Wormhole media: {data?.length}</p>
      <Button
        title={toggleFind ? "Hide" : "Search for users"}
        classes="my-5"
        onClick={() => setToggleFind(!toggleFind)}
      />
      {toggleFind && (
        <input
          type="text"
          value={findUsers}
          onChange={(e) => setFindUsers(e.target.value)}
          className="bg-black/50 border border-fuchsia-600/20 shadow-md shadow-fuchsia-600/50 rounded-md mt-2 mb-5 focus:outline-none"
        />
      )}
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
          const fullName = el.firstName.toLowerCase() + " " + el.lastName.toLowerCase();
          const filteredUser = data?.filter(() => fullName.includes(findUsers.toLowerCase()));
          const returnUser = (
            <div
              key={el.id}
              className={`flex items-center bg-gradient-to-b from-black/80 via-fuchsia-800/40 to-black/80 rounded-md my-4 p-2 justify-between shadow-lg shadow-fuchsia-400/50 hover:translate-x-2 hover:-translate-y-2 hover:shadow-fuchsia-400 hover:shadow-xl ${
                isFriend && "text-fuchsia-200 font-bold"
              } ${isBlocked && "text-fuchsia-800 text-thin"} ${
                hostile && "pointer-events-none opacity-70"
              }`}>
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
              {hostile && <FaUserSecret className="text-fuchsia-600 ml-5" />}
              {admin && (
                <BsTrash3Fill
                  className="text-fuchsia-600 ml-5 hover:cursor-pointer"
                  onClick={() => deleteUser(el.username)}
                />
              )}
            </div>
          );
          if (toggleFind) {
            if (filteredUser.find((fil) => fil === el)) return returnUser;
          } else return returnUser;
        }
      })}
    </div>
  );
};

export default Users;
