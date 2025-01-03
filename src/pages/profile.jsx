import React, { useState, useEffect, useRef } from "react";
import { Form, useNavigate } from "react-router-dom";
import PersonalDetails from "../components/personalDetails";
import Posts from "../components/posts";
import Button from "../components/custom/Button";
import { api } from "../core/api";
import { useUpdate } from "../hooks/use-update";
import { supabase } from "../core/supabase";
import { AiFillCloseCircle } from "react-icons/ai";
import { BsFillFileImageFill } from "react-icons/bs";
import {
  FaUserSlash,
  FaUserPlus,
  FaUserCheck,
  FaUserTimes,
  FaUserMinus,
  FaUserLock,
  FaUnlockAlt,
} from "react-icons/fa";
import Loading from "../components/custom/loading";
import { v4 as uuid } from "uuid";

// Profile page - shows user's personal details as well as his own posts that can be edited or deleted

const Profile = (props) => {
  const { data: userList, isLoading: usersLoading } = useUpdate("/users");
  const {
    data: friendList,
    refetch: refetchFriendList,
    isLoading: friendsLoading,
  } = useUpdate("/friendList");
  const {
    data: requestList,
    refetch: refetchRequests,
    isLoading: requestsLoading,
  } = useUpdate("friendRequests");
  const {
    data: blockList,
    refetch: refetchBlockList,
    isLoading: blocksLoading,
  } = useUpdate("/blockList");
  const { refetch: refetchPosts, isLoading: postsLoading } = useUpdate("/posts");
  const { isLoading: commentsLoading } = useUpdate("/comments");
  const curUsername = localStorage.getItem("curUser");
  const [addPost, setAddPost] = useState(false);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const currentUser = props.stranger
    ? props.stranger
    : userList?.find((el) => el.username === curUsername);
  const loggedInUser = userList?.find((el) => el.username === curUsername);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  // Checks if you sent a friend request to the user you are looking at
  const pendingRequest = requestList?.find(
    (el) => el.recipient === currentUser?.id && el.sender === loggedInUser?.id
  );
  // Checks if you received a friend request from the users you are looking at
  const incomingRequest = requestList?.find(
    (el) => el.recipient === loggedInUser?.id && el.sender === currentUser?.id
  );
  // Checks if the current user is already in your friend list
  const isFriend = friendList?.find(
    (el) =>
      (el.firstUser === loggedInUser?.id && el.secondUser === currentUser?.id) ||
      (el.firstUser === currentUser?.id && el.secondUser === loggedInUser?.id)
  );
  // Checks if the current user is in your block list
  const isBlocked = blockList?.find(
    (el) => el.blocker === loggedInUser?.id && el.blocked === currentUser?.id
  );

  useEffect(() => {
    if (!token) navigate("/");
    return () => {
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
    };
  }, [image]);

  // Changes input:file value
  const handleFileChange = (e) => {
    console.log(e.target.files[0]);
    setImage(e.target.files[0]);
  };

  // Post req for creating a post
  const createPost = async () => {
    setSubmitting(true);
    const uniqueID = uuid();
    const handleUpload = async () => {
      const { data, error } = await supabase.storage
        .from("imgs")
        .upload(`posts/${uniqueID}`, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.log("Error uploading file...", error);
      } else {
        console.log("File uploaded!", data.path);
      }
      const { data: dataGet, error: errorGet } = await supabase.storage.from("imgs").list("posts");

      if (errorGet) {
        console.log("Error listing files...", errorGet);
      } else {
        console.log("Files listed!", dataGet);
      }
    };
    image && handleUpload();
    console.log(image);
    const postReqPayload = {
      userID: Number(currentUser?.id),
      message,
      image: image
        ? `https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/imgs/posts/${uniqueID}`
        : "",
    };
    await api
      .post("/posts", postReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetchPosts())
      .catch((err) => console.log(`Post req err - ${err}`));

    setMessage("");
    setImage("");
    setAddPost(false);
    setSubmitting(false);
  };

  // Send friend request to another user
  const sendFriendRequest = async () => {
    const postReqPayload = {
      sender: loggedInUser?.id,
      recipient: currentUser?.id,
    };
    await api
      .post("/friendRequests", postReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetchRequests())
      .catch((err) => console.log(`Post req - ${err}`));
  };

  // Function for handling friend requests - both accepting and deleting
  const friendRequestHandler = async (id, value, status) => {
    const sender = currentUser?.id;
    await api
      .delete(`/friendRequests/${id}/${sender}/${value}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetchRequests())
      .catch((err) => console.log(`Delete req - ${err}`));

    if (status) {
      const postReqPayload = {
        firstUser: sender,
        secondUser: value,
      };
      await api
        .post("/friendList", postReqPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => await refetchFriendList())
        .catch((err) => console.log(`Post req - ${err}`));
    }
  };

  // Remove friend from friend list
  const removeFriend = async () => {
    await api
      .delete(`/friendList/${isFriend?.id}/${loggedInUser?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetchFriendList())
      .catch((err) => console.log(`Delete req err - ${err}`));
  };

  // Block another user
  const blockUser = async () => {
    if (isFriend) removeFriend();
    if (pendingRequest) friendRequestHandler(pendingRequest?.id, loggedInUser?.id);
    if (incomingRequest) friendRequestHandler(incomingRequest?.id, loggedInUser?.id);

    const postReqPayload = {
      blocker: loggedInUser?.id,
      blocked: currentUser?.id,
    };
    await api
      .post("/blockList", postReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetchBlockList())
      .catch((err) => console.log(`Delete req - ${err}`));
  };

  // Unblock another user
  const unblockUser = async () => {
    const id = isBlocked?.id;
    const blocker = loggedInUser?.id;
    await api
      .delete(`/blockList/${id}/${blocker}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => await refetchBlockList())
      .catch((err) => console.log(`Delete req - ${err}`));
  };

  const loading =
    usersLoading ||
    friendsLoading ||
    requestsLoading ||
    blocksLoading ||
    postsLoading ||
    commentsLoading;

  if (loading) return <Loading font="text-[2rem]" icon="w-[5rem] h-[5rem]" />;

  return (
    <div className="flex flex-col items-center">
      {/* If not your own profile, displays friend list options based on your current relationship with the current user */}
      {props.stranger &&
        (pendingRequest ? (
          <div className="flex mt-10 items-center bg-black bg-opacity-50 p-2 rounded-md">
            <h3>Friend request sent!</h3>
            <FaUserSlash
              className={`w-10 h-10 hover:cursor-pointer ml-2 ${
                isBlocked && "pointer-events-none opacity-50"
              }`}
              onClick={() => friendRequestHandler(pendingRequest?.id)}
            />
          </div>
        ) : isFriend ? (
          <div className="text-yellow-400 flex mt-10 items-center bg-black bg-opacity-50 p-2 rounded-md">
            <p>Remove friend</p>
            <FaUserMinus
              className={`w-10 h-10 hover:cursor-pointer ml-2 ${
                isBlocked && "pointer-events-none opacity-50"
              }`}
              onClick={removeFriend}
            />
          </div>
        ) : (
          !incomingRequest && (
            <div className="text-yellow-400 flex mt-10 items-center bg-black bg-opacity-50 p-2 rounded-md">
              <p>Send friend request</p>
              <FaUserPlus
                className={`w-10 h-10 hover:cursor-pointer ml-2 ${
                  isBlocked && "pointer-events-none opacity-50"
                }`}
                onClick={sendFriendRequest}
              />
            </div>
          )
        ))}
      {/* If not your own profile and the user is not admin, displays the possibility to either block or unblock the user */}
      {props?.stranger &&
        !props?.stranger?.admin &&
        (isBlocked ? (
          <div className="flex mt-10 items-center bg-black bg-opacity-50 p-2 rounded-md text-gray-400">
            <h3>Unblock user</h3>
            <FaUnlockAlt className="w-10 h-10 hover:cursor-pointer ml-2" onClick={unblockUser} />
          </div>
        ) : (
          <div className="flex mt-10 items-center bg-black bg-opacity-50 p-2 rounded-md text-gray-400">
            <h3>Block user</h3>
            <FaUserLock className="w-10 h-10 hover:cursor-pointer ml-2" onClick={blockUser} />
          </div>
        ))}
      {/* Displays a list of friend requests from other users */}
      {!props.stranger &&
        requestList?.map((el) => {
          if (el.recipient === loggedInUser?.id) {
            const sender = userList?.find((arg) => arg.id === el.sender);
            return (
              <div key={el.id} className="flex items-center mt-10 text-yellow-400">
                <p className="mr-2">
                  {sender.firstName} {sender.lastName} has sent you a friend request
                </p>
                <FaUserCheck
                  className="mx-2 w-10 h-10 hover:cursor-pointer"
                  onClick={() => friendRequestHandler(el.id, sender?.id, "accept")}
                />
                <FaUserTimes
                  className="mx-2 w-10 h-10 hover:cursor-pointer"
                  onClick={() => friendRequestHandler(el.id, sender?.id)}
                />
              </div>
            );
          }
        })}
      <PersonalDetails
        id={currentUser?.id}
        firstName={currentUser?.firstName}
        lastName={currentUser?.lastName}
        username={currentUser?.username}
        age={currentUser?.age}
        gender={currentUser?.gender}
        race={currentUser?.race}
        birthDate={currentUser?.birthDate}
        occupation={currentUser?.occupation}
        profilePicture={currentUser?.profilePicture}
        origin={currentUser?.origin}
        admin={currentUser?.admin}
        stranger={props.stranger ? props.stranger : false}
      />
      <div className="mt-5 flex flex-col items-center">
        {/* Toggles the state for adding a new post if it's your own profile, otherwise add the option to go back to view all users */}
        {props.stranger ? (
          <p className="text-yellow-400 underline mt-5 hover:cursor-pointer" onClick={props.back}>
            Back
          </p>
        ) : (
          <div onClick={() => setAddPost(!addPost)}>
            <Button title={addPost ? "Hide" : "Add new post"} />
          </div>
        )}
        {/* Displays the form for adding a new post if addPost is true */}
        {addPost && (
          <Form className="border border-white rounded-lg shadow-lg shadow-white p-5 flex flex-col items-center bg-black bg-opacity-50 mt-5">
            <div className="flex">
              <label htmlFor="message">Message:</label>
              <textarea
                name="message"
                id="message"
                cols="30"
                rows="10"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-transparent border border-white rounded-lg p-2"
              />
            </div>
            <div className="flex items-center w-full justify-between my-2">
              <p>Image:</p>
              <label htmlFor="pic" className="flex w-[15rem] text-[0.7rem] hover:cursor-pointer">
                <BsFillFileImageFill /> Upload image {image && "uploaded img"}
              </label>
              <input
                type="file"
                name="pic"
                id="pic"
                size="10"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              {image && (
                <AiFillCloseCircle
                  className="w-3 h-3 hover:cursor-pointer mr-2"
                  onClick={() => {
                    fileInputRef.current.value = null;
                    setImage(null);
                  }}
                />
              )}
            </div>
            <Button
              title={submitting ? "Submitting..." : "Submit"}
              submit
              classes={`${
                ((!message && !image) || submitting) && "pointer-events-none opacity-50"
              }`}
              onClick={() => {
                createPost();
                fileInputRef.current.value = null;
              }}
            />
          </Form>
        )}
      </div>
      {/* User's own posts */}
      {props.stranger ? <Posts profile stranger={props.stranger} /> : <Posts profile />}
    </div>
  );
};

export default Profile;
