import React, { useState, useEffect, useRef, useContext } from "react";
import Comment from "./comment";
import Button from "../components/custom/Button";
import Loading from "./custom/loading";
import { api } from "../core/api";
import { Form } from "react-router-dom";
import { useUpdate } from "../hooks/use-update";
import { GiGreatPyramid, GiRadioactive, GiClusterBomb } from "react-icons/gi";
import { BsFillXCircleFill, BsFillFileImageFill } from "react-icons/bs";
import { AiFillCloseCircle } from "react-icons/ai";
import supabase from "../core/supabase";
import {
  FaComments,
  FaCommentMedical,
  FaCommentSlash,
  FaPencilAlt,
  FaShare,
  FaSpaceShuttle,
} from "react-icons/fa";
import { BiMessageSquareAdd, BiMessageSquareEdit } from "react-icons/bi";
import { v4 as uuid } from "uuid";
import { NotificationContext } from "../context/NotificationContext";

// Post component

const Post = (props) => {
  const { notifyContext, setStatus } = useContext(NotificationContext);

  const { refetch: refetchPosts, isLoading: postsLoading } = useUpdate("/posts");
  const {
    data: commentList,
    refetch: refetchComments,
    isLoading: commentsLoading,
  } = useUpdate("/comments");
  const { data: userList, isLoading: usersLoading } = useUpdate("/users");
  const { data: likeList, refetch: refetchLikes, isLoading: likesLoading } = useUpdate("/likes");
  const {
    data: dislikeList,
    refetch: refetchDislikes,
    isLoading: dislikesLoading,
  } = useUpdate("/dislikes");
  const loading =
    postsLoading || commentsLoading || usersLoading || likesLoading || dislikesLoading;

  const [comments, setComments] = useState(false);
  const [addComment, setAddComment] = useState(false);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [likedUsers, setLikedUsers] = useState(false);
  const [dislikedUsers, setDislikedUsers] = useState(false);
  const [clickLikedUsers, setClickLikedUsers] = useState(false);
  const [clickDislikedUsers, setClickDislikedUsers] = useState(false);
  const fileInputRef = useRef(null);
  const editedFileInputRef = useRef(null);
  const [editPost, setEditPost] = useState(false);
  const [editedMsg, setEditedMsg] = useState("");
  const [editedImg, setEditedImg] = useState(null);
  const [deletedPostPic, setDeletedPostPic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [sharedMessage, setSharedMessage] = useState("");

  const curUsername = localStorage.getItem("curUser");
  const curUser = userList.find((el) => el.username === curUsername);
  const admin = curUser?.admin;
  const id = curUser?.id;
  const token = localStorage.getItem("token");
  const personSharing = userList.find((el) => el.id === props.sharedBy);
  const postOwner = userList.find((el) => el.id === props.userID);

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      if (editedImg) {
        URL.revokeObjectURL(editedImg.preview);
      }
    };
  }, [image, editedImg]);

  // Change input:file value
  const handleFileChange = (e) => {
    console.log(e.target.files[0]);
    setImage(e.target.files[0]);
  };

  const handleEditedFileChange = (e) => {
    console.log(e.target.files[0]);
    setEditedImg(e.target.files[0]);
  };

  // Edit a post
  const editPostReq = async () => {
    setSubmitting(true);
    const uniqueID = uuid();
    const handleEditedUpload = async () => {
      const { data, error } = await supabase.storage
        .from("imgs")
        .upload(`posts/${uniqueID}`, editedImg, {
          cacheControl: "3600",
          upsert: false,
        });

      if (props.image) {
        const { data: curData } = await supabase.storage.from("imgs").list("posts");
        const curFile = curData.find((el) => props.image.includes(el.name));
        const { data: deletedData, error: deletedError } = await supabase.storage
          .from("imgs")
          .remove([`posts/${curFile.name}`]);
        if (deletedError) {
          console.log("Error deleting files...", deletedError);
        } else {
          console.log("File removed successfully!", deletedData.path);
        }
      }

      const { data: dataGet, error: errorGet } = await supabase.storage.from("imgs").list("posts");

      if (error) {
        console.log("Error uploading file...", error);
      } else {
        console.log("File uploaded!", data.path);
      }

      if (errorGet) {
        console.log("Error listing files...", errorGet);
      } else {
        console.log("Files listed!", dataGet);
      }
    };
    editedImg && handleEditedUpload();
    const defaultImgOrNone = deletedPostPic ? "NULL" : props.image;
    const patchReqPayload = {
      userID: id,
      message: editedMsg ? editedMsg : props.message,
      image: editedImg
        ? `https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/imgs/posts/${uniqueID}`
        : defaultImgOrNone,
      updatedAt: new Date(),
    };

    await api
      .patch(`/posts/${props.postID}`, patchReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => {
        await refetchPosts();
        setStatus("success");
        notifyContext(
          <div className="flex items-center">
            <FaSpaceShuttle className="mr-2" /> <span>Post edited successfully!</span>
          </div>,
          "success"
        );
      })
      .catch((err) => {
        console.log(`Patch req - ${err}`);
        setStatus("error");
        notifyContext(
          <div className="flex items-center">
            <GiRadioactive className="mr-2" /> <span>Could not edit the post!</span>
          </div>,
          "error"
        );
      })
      .finally(() => {
        setSubmitting(false);
        editedFileInputRef.current.value = null;
        setEditedImg(null);
        setEditedMsg("");
        setEditPost(false);
        setDeletedPostPic(false);
      });
  };

  // Get month name from createdAt, updatedAt
  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);

    return date.toLocaleString("en-US", { month: "short" });
  };

  // Counts post's comments
  const commentCount = () => {
    let count = 0;
    commentList.map((el) => {
      if (el.postID === props.postID) count++;
    });
    return count;
  };

  // Counts post's likes
  const likeCount = () => {
    let count = 0;
    likeList.map((el) => {
      if (el.postID === props.postID) count++;
    });
    return count;
  };

  // Counts post's dislikes
  const dislikeCount = () => {
    let count = 0;
    dislikeList.map((el) => {
      if (el.postID === props.postID) count++;
    });
    return count;
  };

  // Deletes a post, only possible on user's profile
  const deleteReq = async () => {
    if (window.confirm("Really wanna delete the post?")) {
      setSubmitting(true);
      if (props.image && !props.shared) {
        const { data: presentData } = await supabase.storage.from("imgs").list("posts");
        const curFile = presentData.find((el) => props.image.includes(el.name));
        console.log(curFile);
        const { data, error } = await supabase.storage
          .from("imgs")
          .remove([`posts/${curFile.name}`]);

        if (error) {
          console.log("Error deleting file", error);
        } else {
          console.log("File successfully deleted!", data);
        }
      }

      await api
        .delete(`/posts/${props.postID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => {
          await refetchPosts();
          setStatus("success");
          notifyContext(
            <div className="flex items-center">
              <GiClusterBomb className="mr-2" /> <span>Post deleted successfully!</span>
            </div>,
            "success"
          );
        })
        .catch((err) => {
          console.log(`Delete req err - ${err}`);
          setStatus("error");
          notifyContext(
            <div className="flex items-center">
              <GiRadioactive className="mr-2" /> <span>Could not delete the post!</span>
            </div>,
            "error"
          );
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };

  // Checks if the user already liked the post
  const alreadyLiked = likeList?.find(
    (el) => el.postID === props.postID && el.userID === Number(id)
  );

  // Checks if the user already disliked the post
  const alreadyDisliked = dislikeList?.find(
    (el) => el.postID === props.postID && el.userID === Number(id)
  );

  // Likes a post
  const toggleLike = async () => {
    const postReqPayload = {
      postID: props.postID,
      userID: Number(id),
    };

    setSubmitting(true);
    if (alreadyLiked) {
      await api
        .delete(`/likes/${alreadyLiked.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => await refetchLikes())
        .catch((err) => console.log(`Delete req err - ${err}`));
    } else if (alreadyDisliked) {
      await api
        .delete(`/dislikes/${alreadyDisliked.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => await refetchDislikes())
        .catch((err) => console.log(`Delete req err - ${err}`));

      await api
        .post("/likes", postReqPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => await refetchLikes())
        .catch((err) => console.log(`Post req err - ${err}`));
    } else {
      await api
        .post("/likes", postReqPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => await refetchLikes())
        .catch((err) => console.log(`Post req err - ${err}`));
    }
    setSubmitting(false);
  };

  // Dislikes a post
  const toggleDislike = async () => {
    const postReqPayload = {
      postID: props.postID,
      userID: Number(id),
    };

    setSubmitting(true);
    if (alreadyDisliked) {
      await api
        .delete(`/dislikes/${alreadyDisliked.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => refetchDislikes())
        .catch((err) => console.log(`Delete req err - ${err}`));
    } else if (alreadyLiked) {
      await api
        .delete(`/likes/${alreadyLiked.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => refetchLikes())
        .catch((err) => console.log(`Delete req err - ${err}`));

      await api
        .post("/dislikes", postReqPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => refetchDislikes())
        .catch((err) => console.log(`Post req err - ${err}`));
    } else {
      await api
        .post("/dislikes", postReqPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => refetchDislikes())
        .catch((err) => console.log(`Post req err - ${err}`));
    }
    setSubmitting(false);
  };

  // Creates a comment
  const createComment = async () => {
    setSubmitting(true);
    const uniqueID = uuid();
    // Upload an img to Supabase storage
    const handleUpload = async () => {
      const { data, error } = await supabase.storage
        .from("imgs")
        .upload(`comments/${uniqueID}`, image, {
          cacheControl: "3600",
          upsert: false,
        });

      const { dataGet, errorGet } = await supabase.storage.from("imgs").list("comments");

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
      postID: props.postID,
      userID: Number(id),
      image: image
        ? `https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/imgs/comments/${uniqueID}`
        : "",
      message,
    };

    await api
      .post("/comments", postReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => {
        await refetchComments();
        setStatus("success");
        notifyContext(
          <div className="flex items-center">
            <FaSpaceShuttle className="mr-2" /> <span>Comment added successfully!</span>
          </div>,
          "success"
        );
      })
      .catch((err) => {
        console.log(`Post req err - ${err}`);
        setStatus("error");
        notifyContext(
          <div className="flex items-center">
            <GiRadioactive className="mr-2" /> <span>Could not add the comment!</span>
          </div>,
          "error"
        );
      })
      .finally(() => {
        setImage("");
        setMessage("");
        setAddComment(false);
        setComments(true);
        setSubmitting(false);
      });
  };

  let count = 0;

  const toggleShare = () => {
    setComments(false);
    setAddComment(false);
    setSharing(!sharing);
  };

  const sharePost = async () => {
    const postReqPayload = {
      image: props.image,
      message: props.message,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      userID: props.userID,
      shared: true,
      sharedBy: id,
      sharedMessage,
    };

    setSubmitting(true);
    await api
      .post("/posts", postReqPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => {
        await refetchPosts();
        setStatus("success");
        notifyContext(
          <div className="flex items-center">
            <FaSpaceShuttle className="mr-2" /> <span>Post shared successfully!</span>
          </div>,
          "success"
        );
      })
      .catch((err) => {
        console.log(`Post req - ${err}`);
        setStatus("error");
        notifyContext(
          <div className="flex items-center">
            <GiRadioactive className="mr-2" /> <span>Could not share the post!</span>
          </div>,
          "error"
        );
      })
      .finally(() => {
        setSubmitting(false);
        setSharedMessage("");
        setSharing(false);
      });
  };

  // Checks if post has been updated or not
  const time = props.createdAt === props.updatedAt ? props.createdAt : props.updatedAt;

  if (loading) return <Loading font="text-[1rem]" icon="w-[3rem] h-[3rem]" />;

  return editPost ? (
    <div
      className={`flex flex-col bg-black/80 p-5 border border-fuchsia-600/20 rounded-md shadow-lg shadow-fuchsia-600/50 [&>*]:my-2 w-[min(90%,40rem)] ${
        submitting && "opacity-70 pointer-events-none"
      }`}>
      <div className="flex items-center">
        <label htmlFor="msg">Message:</label>
        <textarea
          name="msg"
          id="msg"
          defaultValue={props.message}
          onChange={(e) => setEditedMsg(e.target.value)}
          className="w-[20rem] h-[10rem] bg-transparent border border-fuchsia-600/20 rounded-md ml-5 shadow-md shadow-fuchsia-400/50 focus:outline-none"></textarea>
      </div>
      <div className="flex items-center">
        <p>Image:</p>
        <label htmlFor="img" className="flex ml-10 my-2 hover:cursor-pointer">
          <BsFillFileImageFill /> Upload image {editedImg && "uploaded img"}
        </label>
        <input
          type="file"
          name="img"
          id="img"
          accept="image/*"
          className="hidden"
          onChange={handleEditedFileChange}
          ref={editedFileInputRef}
        />
        {editedImg && (
          <BsFillXCircleFill
            className="w-3 h-3 hover:cursor-pointer"
            onClick={() => {
              editedFileInputRef.current.value = null;
              setEditedImg(null);
            }}
          />
        )}
        {!editedImg && props.image && (
          <BsFillXCircleFill
            className="w-3 h-3 hover:cursor-pointer"
            onClick={() => {
              setDeletedPostPic(true);
              setEditedMsg(props.message);
            }}
          />
        )}
      </div>
      <div className="flex self-center [&>*]:mx-2">
        <Button
          submit
          title="Submit"
          classes={!editedMsg && !editedImg && "pointer-events-none opacity-50"}
          onClick={editPostReq}
        />
        <Button title="Back" onClick={() => setEditPost(false)} />
      </div>
    </div>
  ) : (
    <div
      className={`relative grid justify-items-center items-center gap-y-2 ${
        props.shared
          ? "grid-rows-[min-content,0.5rem,8rem,min-content]"
          : "grid-rows-[0.5rem,8rem,min-content]"
      } grid-cols-[2fr,2fr,6fr] border border-fuchsia-600/20 rounded-md w-[min(90%,40rem)] text-[0.8rem] sm:text-[1rem] p-4 bg-black/90 mb-20
       shadow-lg shadow-fuchsia-600 ${submitting && "opacity-70 pointer-events-none"}`}>
      {props.shared && (
        <div className="flex flex-col justify-center col-span-full p-5 mb-5 border-fuchsia-400 border-b-4">
          <div className="flex justify-around items-center mx-2">
            <img
              src={personSharing?.profilePicture}
              alt="profilePic"
              className="w-auto h-auto max-w-[5rem] max-h-[5rem] rounded-lg"
            />
            <p className="font-bold text-fuchsia-400">
              {personSharing?.firstName} {personSharing?.lastName} shared this post{" "}
              {props.sharedMessage && "saying:"}
            </p>
          </div>
          <div className="flex justify-center items-center">
            <p>{props.sharedMessage}</p>
          </div>
        </div>
      )}
      {(props.profile || admin) && (
        <div className="absolute top-5 right-5 hover:cursor-pointer" onClick={deleteReq}>
          <BsFillXCircleFill className="w-5 h-5 text-fuchsia-800" />
        </div>
      )}
      {props.profile && !props.shared && (
        <div
          className="absolute top-5 right-20 hover:cursor-pointer"
          onClick={() => setEditPost(true)}>
          <FaPencilAlt className="w-5 h-5 text-fuchsia-800" />
        </div>
      )}
      <div className="col-span-full w-full h-full text-[0.5rem] flex justify-center items-center">
        {props.createdAt === props.updatedAt ? (
          <BiMessageSquareAdd className="w-5 h-5" />
        ) : (
          <BiMessageSquareEdit className="w-5 h-5" />
        )}
        <div>
          {time.slice(0, 4)} {getMonthName(time.slice(5, 7))} {time.slice(8, 10)}{" "}
          {time.slice(11, 19)}
        </div>
      </div>
      <div className="w-full h-full flex justify-center items-center border-b border-fuchsia-300">
        <img
          src={props.shared ? postOwner?.profilePicture : props.profilePicture}
          alt="profilePic"
          className="w-auto h-auto max-w-full max-h-full rounded-lg"
        />
      </div>
      <div className="text-3xl col-start-2 col-end-4 border-b border-fuchsia-300 w-full h-full flex justify-center items-center">
        <h1>
          {props.shared ? postOwner?.firstName : props.firstName}{" "}
          {props.shared ? postOwner?.lastName : props.lastName}
        </h1>
      </div>
      {props.image !== "NULL" && props.image !== "" && (
        <img
          src={props.image}
          alt="some img"
          className="col-span-full w-auto h-auto max-w-full max-h-full rounded-sm"
        />
      )}
      {props.message !== "NULL" && props.message !== "" && (
        <p className="col-span-full">{props.message}</p>
      )}
      <div className="flex items-center justify-center w-full h-full border-t border-fuchsia-300 py-2 relative">
        <p
          onMouseEnter={() => {
            setLikedUsers(true);
            setClickDislikedUsers(false);
          }}
          onMouseLeave={() => {
            setLikedUsers(false);
          }}
          onClick={() => {
            setClickLikedUsers(!clickLikedUsers);
            setLikedUsers(false);
            setDislikedUsers(false);
            setClickDislikedUsers(false);
          }}>
          {likeCount()}{" "}
        </p>
        {likedUsers && likeCount() > 0 && (
          <div className="absolute flex flex-col w-[10rem] h-20 text-[0.6rem] p-2 bg-black border border-fuchsia-300 rounded-md top-[4rem]">
            Liked by:
            {userList.map((el) => {
              const userLikedPost = likeList.find(
                (like) => like.postID === props.postID && like.userID === el.id
              );
              if (userLikedPost) {
                count++;
                if (count < 3) {
                  return (
                    <p key={el.id}>
                      {el.firstName} {el.lastName}
                    </p>
                  );
                }
              }
            })}
            {count > 2 && <p>and {count - 2} others</p>}
          </div>
        )}
        {clickLikedUsers && likeCount() > 0 && (
          <div className="absolute flex flex-col justify-center items-center [&>*]:mb-2 w-[10rem] h-auto text-[0.5rem] p-2 bg-black z-50 border border-fuchsia-300 rounded-md top-[4rem]">
            {userList.map((el) => {
              const userLikedPost = likeList.find(
                (like) => like.postID === props.postID && like.userID === el.id
              );
              if (userLikedPost) {
                return (
                  <div key={el.id} className="flex justify-between items-center w-full">
                    <p>
                      {el.firstName} {el.lastName}
                    </p>
                    <img
                      src={el.profilePicture}
                      alt="profilePic"
                      className="max-w-[3rem] max-h-[3rem] w-auto h-auto"
                    />
                  </div>
                );
              }
            })}
          </div>
        )}
        <GiGreatPyramid
          className="w-10 h-10 ml-2 hover:cursor-pointer text-fuchsia-800"
          onClick={toggleLike}
        />
      </div>
      <div className="flex items-center justify-center w-full h-full border-t border-fuchsia-300 py-2 relative">
        <p
          onMouseEnter={() => {
            setDislikedUsers(true);
            setClickLikedUsers(false);
          }}
          onMouseLeave={() => {
            setDislikedUsers(false);
          }}
          onClick={() => {
            setClickDislikedUsers(!clickDislikedUsers);
            setLikedUsers(false);
            setDislikedUsers(false);
            setClickLikedUsers(false);
          }}>
          {dislikeCount()}{" "}
        </p>
        {dislikedUsers && dislikeCount() > 0 && (
          <div className="absolute flex flex-col w-[10rem] h-20 text-[0.6rem] p-2 bg-black border border-fuchsia-300 rounded-md top-[4rem]">
            Disliked by:
            {userList.map((el) => {
              const userDislikedPost = dislikeList.find(
                (dislike) => dislike.postID === props.postID && dislike.userID === el.id
              );
              if (userDislikedPost) {
                count++;
                if (count < 3) {
                  return (
                    <p key={el.id}>
                      {el.firstName} {el.lastName}
                    </p>
                  );
                }
              }
            })}
            {count > 2 && <p>and {count - 2} others</p>}
          </div>
        )}
        {clickDislikedUsers && dislikeCount() > 0 && (
          <div className="absolute flex flex-col justify-center items-center [&>*]:mb-2 w-[10rem] h-auto text-[0.5rem] p-2 bg-black z-50 border border-fuchsia-300 rounded-md top-[4rem]">
            {userList.map((el) => {
              const userDislikedPost = dislikeList.find(
                (dislike) => dislike.postID === props.postID && dislike.userID === el.id
              );
              if (userDislikedPost) {
                return (
                  <div key={el.id} className="flex justify-between items-center w-full">
                    <p>
                      {el.firstName} {el.lastName}
                    </p>
                    <img
                      src={el.profilePicture}
                      alt="profilePic"
                      className="max-w-[3rem] max-h-[3rem] w-auto h-auto"
                    />
                  </div>
                );
              }
            })}
          </div>
        )}
        <GiGreatPyramid
          className="w-10 h-10 ml-2 rotate-180 hover:cursor-pointer text-fuchsia-800"
          onClick={toggleDislike}
        />
      </div>
      <div className="flex items-center justify-around w-full h-full border-t border-fuchsia-300 py-2">
        <div
          className="flex items-center justify-center hover:cursor-pointer"
          onClick={() => {
            setComments(!comments);
            setAddComment(false);
            setSharing(false);
          }}>
          <p className="mr-2">Comments{commentCount() > 0 ? ` : ${commentCount()}` : " : 0"}</p>{" "}
          <FaComments className="w-10 h-10 text-fuchsia-800 ml-2" />
        </div>
        {!props.profile && id !== props.userID && !props.shared && (
          <div
            className="flex items-center justify-center hover:cursor-pointer"
            onClick={() => toggleShare()}>
            <p className="mr-2">Share</p>
            <FaShare className="w-10 h-10 text-fuchsia-800 ml-2" />
          </div>
        )}
      </div>
      <div className="col-span-full w-full flex flex-col items-center">
        {comments &&
          commentList.map((el) => {
            const userMatch = userList.find((user) => user.id === el.userID);
            if (el.postID === props.postID)
              return (
                <Comment
                  key={el.id}
                  id={el.id}
                  firstName={userMatch.firstName}
                  lastName={userMatch.lastName}
                  profilePicture={userMatch.profilePicture}
                  image={el.image}
                  message={el.message}
                  userID={el.userID}
                />
              );
          })}
        <div className="self-center mt-2 flex flex-col items-center">
          <div
            onClick={() => {
              setAddComment(!addComment);
              setComments(false);
              setSharing(false);
            }}>
            <Button
              classes="!border-none text-fuchsia-800 !bg-transparent shadow-none"
              title={
                addComment ? (
                  <FaCommentSlash className="w-5 h-5" />
                ) : (
                  <FaCommentMedical className="w-5 h-5" />
                )
              }
            />
          </div>
          {addComment && (
            <Form className="flex flex-col mt-2 border border-fuchsia-600/20 rounded-lg p-5 [&>*]:my-2 shadow-md shadow-fuchsia-400/50">
              <div className="flex items-center">
                <label htmlFor="message">Message:</label>
                <textarea
                  name="message"
                  id="message"
                  cols="30"
                  rows="10"
                  className="max-w-[20rem] max-h-[5rem] bg-transparent border border-fuchsia-600/20 shadow-md shadow-fuchsia-600/50 rounded-md ml-2 focus:outline-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <p className="min-w-[10rem] ml-2">Image:</p>
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
                classes={`self-center ${
                  ((!message && !image) || submitting) && "pointer-events-none opacity-50"
                }`}
                onClick={() => {
                  createComment();
                  fileInputRef.current.value = null;
                }}
              />
            </Form>
          )}
          {sharing && (
            <Form className="flex flex-col mt-2 border border-fuchsia-600/20 shadow-md shadow-fuchsia-600/50 rounded-lg p-5 [&>*]:mt-2">
              <div className="flex items-center">
                <label htmlFor="message">Message (voluntary):</label>
                <textarea
                  name="message"
                  id="message"
                  cols="30"
                  rows="10"
                  className="max-w-[20rem] max-h-[3rem] bg-transparent border border-fuchsia-600/20 shadow-md shadow-fuchsia-600/50 rounded-lg ml-2 focus:outline-none"
                  value={sharedMessage}
                  onChange={(e) => setSharedMessage(e.target.value)}
                />
              </div>
              <Button
                title={submitting ? "Sharing..." : "Share"}
                submit
                classes={`self-center !mt-5 ${submitting && "pointer-events-none opacity-50"}`}
                onClick={sharePost}
              />
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
