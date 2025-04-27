import React, { useState, useEffect, useRef, useContext } from "react";
import { Form, useNavigate } from "react-router-dom";
import Message from "../components/message";
import Button from "../components/custom/Button";
import { api } from "../core/api";
import { useUpdate } from "../hooks/use-update";
import { BsFillArrowRightCircleFill, BsFillFileImageFill } from "react-icons/bs";
import { AiFillCloseCircle } from "react-icons/ai";
import { FcVip } from "react-icons/fc";
import { GiCircleSparks, GiRadioactive, GiClusterBomb } from "react-icons/gi";
import supabase from "../core/supabase";
import Loading from "../components/custom/loading";
import { v4 as uuid } from "uuid";
import tyjelk from "../imgs/tealc-clone.gif";
import { NotificationContext } from "../context/NotificationContext";

const Messages = () => {
  const { notifyContext, setStatus } = useContext(NotificationContext);

  const { data: userList, isLoading: usersLoading } = useUpdate("/users");
  const {
    data: messageList,
    refetch: refetchMessages,
    isLoading: messagesLoading,
  } = useUpdate("/messages");
  const { data: friendList, isLoading: friendsLoading } = useUpdate("/friendList");
  const [msgRecipient, setMsgRecipient] = useState();
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const curUsername = localStorage.getItem("curUser");
  const currentUser = userList?.find((el) => el.username === curUsername);
  const id = currentUser?.id;
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const loading = usersLoading || messagesLoading || friendsLoading;

  useEffect(() => {
    if (!token) navigate("/");
    return () => {
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
    };
  }, [image]);

  const handleFileChange = (e) => {
    console.log(e.target.files[0]);
    setImage(e.target.files[0]);
  };

  const sendMessage = async () => {
    setSubmitting(true);
    const uniqueID = uuid();
    const handleUpload = async () => {
      const { data, error } = await supabase.storage
        .from("imgs")
        .upload(`messages/${uniqueID}`, image, {
          cacheControl: "3600",
          upsert: false,
        });

      const { dataGet, errorGet } = await supabase.storage.from("imgs").list("messages");

      if (error) {
        console.log("Error uploading file...", error);
        setStatus("error");
        notifyContext(
          <div className="flex items-center">
            <GiRadioactive className="mr-2" />{" "}
            <span>
              Could not upload the file. A file with the same name most likely already exists. Try
              to rename the file and see if the issue persists!
            </span>
          </div>,
          "error"
        );
      } else {
        console.log("File uploaded!", data.path);
      }

      if (errorGet) {
        console.log("Error listing files...", error);
      } else {
        console.log("Files listed!", dataGet);
      }
    };
    image && handleUpload();

    const postReqPayload = {
      senderID: Number(id),
      recipientID: msgRecipient.id,
      message,
      image: image
        ? `https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/imgs/messages/${uniqueID}`
        : "",
    };

    await api
      .post("/messages", postReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => {
        await refetchMessages();
      })
      .catch((err) => {
        console.log(`Post req - ${err}`);
        setStatus("error");
        notifyContext(
          <div className="flex items-center">
            <GiRadioactive className="mr-2" /> <span>Could not send message!</span>
          </div>,
          "error"
        );
      })
      .finally(() => {
        setMessage("");
        setImage("");
        setSubmitting(false);
      });
  };

  const readMessages = async (senderID, el) => {
    setMsgRecipient(el);
    await api
      .patch(
        "/messages",
        { id, senderID },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(async () => await refetchMessages())
      .catch((err) => console.log(`Delete req - ${err}`));
  };

  const deleteMessage = async (id, image) => {
    if (image) {
      const { data } = await supabase.storage.from("imgs").list("messages");
      const curFile = data.find((el) => image.includes(el.name));
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
      .delete(`/messages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => {
        await refetchMessages();
        setStatus("success");
        notifyContext(
          <div className="flex items-center">
            <GiClusterBomb className="mr-2" /> <span>Message deleted!</span>
          </div>,
          "success"
        );
      })
      .catch((err) => {
        console.log(`Delete req - ${err}`);
        setStatus("error");
        notifyContext(
          <div className="flex items-center">
            <GiRadioactive className="mr-2" /> <span>Could not delete message!</span>
          </div>,
          "error"
        );
      });
  };

  const messagesCheck = messageList?.find(
    (el) =>
      (currentUser.id === el.senderID && msgRecipient?.id === el.recipientID) ||
      (currentUser.id === el.recipientID && msgRecipient?.id === el.senderID)
  );

  const findFriends = friendList?.some(
    (el) => el.firstUser === currentUser.id || el.secondUser === currentUser.id
  );

  if (loading) return <Loading font="text-[2rem]" icon="w-[5rem] h-[5rem]" />;

  return (
    <div className="w-[min(60rem,90%)] min-h-[40rem] grid grid-cols-[1fr,2fr] gap-x-5 mt-10 rounded-lg p-4 justify-items-center bg-black/80">
      <div>
        {userList?.map((el) => {
          const filteredMessages = messageList?.find(
            (msg) =>
              (currentUser.id === msg.senderID && el.id === msg.recipientID) ||
              (currentUser.id === msg.recipientID && el.id === msg.senderID)
          );
          const filterFriends = friendList?.find(
            (arg) =>
              (el.id === arg.firstUser && currentUser.id === arg.secondUser) ||
              (el.id === arg.secondUser && currentUser.id === arg.firstUser) ||
              el.id === currentUser.id
          );
          if (filterFriends) {
            const unreadMessages = messageList?.find(
              (msg) =>
                msg.recipientID === currentUser.id &&
                msg.recipientID !== msg.senderID &&
                !msg.read &&
                msg.senderID === el.id
            );
            return (
              <div
                key={el.id}
                className={`col-start-1 col-end-2 my-5 flex items-center w-full border bg-gradient-to-b from-fuchsia-800/40 via-transparent to-fuchsia-800/40 border-fuchsia-600/50 p-5 hover:cursor-pointer relative rounded-md shadow-lg shadow-fuchsia-400/30 opacity-80 ${
                  !filteredMessages && "!opacity-50 text-fuchsia-600"
                } ${
                  msgRecipient === el &&
                  "text-fuchsia-400 border-2 !shadow-fuchsia-400 from-fuchsia-600/60 via-black/50 to-fuchsia-600/6 !opacity-100"
                }`}
                onClick={() => readMessages(el.id, el)}>
                {el.admin && <FcVip className="w-5 h-5 mr-1" />}
                <img
                  src={el.profilePicture}
                  alt="profilePic"
                  className="w-auto h-auto max-w-[3rem] max-h-[3rem]"
                />
                <p className="text-[0.8rem] ml-2">
                  {el.firstName} {el.lastName}
                </p>
                {unreadMessages && (
                  <GiCircleSparks className="w-3 h-3 text-yellow-400 absolute top-0 right-0 translate-x-1/2 -translate-y-1/2" />
                )}
              </div>
            );
          }
        })}
      </div>
      {!findFriends && !msgRecipient && (
        <div className="flex flex-col self-start w-full items-center text-[0.7rem]">
          <img
            src={tyjelk}
            alt="sholva"
            className="w-auto h-auto max-w-[20rem] max-h-[20rem] rounded-md"
          />
          <p className="mt-2">You have no friends. You can only message yourself for now.</p>
        </div>
      )}
      {msgRecipient && (
        <div className="flex flex-col self-start w-full items-center bg-gradient-to-b rounded-lg from-fuchsia-800/50 via-transparent to-fuchsia-800/50 shadow-md shadow-fuchsia-400/50 p-2">
          <div className="flex justify-center items-center w-full border-b border-fuchsia-300 mt-5">
            {msgRecipient.admin && <FcVip className="w-10 h-10 mr-2" />}
            <img
              src={msgRecipient.profilePicture}
              alt="Recipient"
              className="w-auto h-auto max-w-[10rem] max-h-[5rem] mb-5 rounded-md"
            />
          </div>
          <div className="flex flex-col w-full overflow-auto">
            {messagesCheck ? (
              messageList.map((el) => {
                if (
                  (currentUser.id === el.senderID && msgRecipient.id === el.recipientID) ||
                  (currentUser.id === el.recipientID && msgRecipient.id === el.senderID)
                )
                  return (
                    <Message
                      key={el.id}
                      id={el.id}
                      profilePicture={
                        currentUser.id === el.senderID
                          ? currentUser.profilePicture
                          : msgRecipient.profilePicture
                      }
                      message={el.message !== "NULL" && el.message !== "" && el.message}
                      image={el.image !== "NULL" && el.image !== "" && el.image}
                      sender={currentUser.id === el.senderID ? true : false}
                      deleteMessage={() => deleteMessage(el.id, el.image)}
                    />
                  );
              })
            ) : (
              <p className="text-[0.7rem] self-center">
                You have no messages with {msgRecipient.firstName} {msgRecipient.lastName}
              </p>
            )}
          </div>
          <Form className="flex mt-5">
            <div className="flex flex-col">
              <textarea
                name="message"
                id="message"
                cols="30"
                rows="10"
                className="w-[95%] h-20 justify-self-end self-start ml-2 bg-black rounded-lg overflow-auto shadow-md shadow-fuchsia-400/50 focus:outline-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex items-center mt-2 ml-2">
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
            </div>
            <Button
              title={<BsFillArrowRightCircleFill />}
              submit
              classes={`text-[2rem] max-w-[4rem] max-h-[4rem] self-center !border-none shadow-none bg-transparent ${
                ((!message && !image) || submitting) && "pointer-events-none opacity-70"
              }`}
              onClick={() => {
                sendMessage();
                fileInputRef.current.value = null;
              }}
            />
          </Form>
        </div>
      )}
    </div>
  );
};

export default Messages;
