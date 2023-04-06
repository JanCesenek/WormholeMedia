import React, { useState, useEffect, useRef } from "react";
import classes from "./post.module.scss";
import Comment from "./comment";
import Button from "../components/custom/Button";
import Loading from "./custom/loading";
import { api } from "../core/api";
import { Form } from "react-router-dom";
import { useUpdate } from "../hooks/use-update";
import { GiGreatPyramid } from "react-icons/gi";
import { BsFillXCircleFill, BsFillFileImageFill } from "react-icons/bs";
import { AiFillCloseCircle } from "react-icons/ai";
import { createClient } from "@supabase/supabase-js";
import { supStorageURL, supStorageKEY } from "../core/supabaseStorage";
import { FaComments, FaCommentMedical, FaCommentSlash, FaPencilAlt } from "react-icons/fa";
import { BiMessageSquareAdd, BiMessageSquareEdit } from "react-icons/bi";
import { v4 as uuid } from "uuid";

// Post component

const Post = (props) => {
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

  const curUsername = localStorage.getItem("curUser");
  const curUser = userList.find((el) => el.username === curUsername);
  const admin = curUser?.admin;
  const id = curUser?.id;
  const token = localStorage.getItem("token");

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

  // Supabase client had to be created to allow user to upload imgs there
  const supabase = createClient(supStorageURL, supStorageKEY);

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
      .then(async () => await refetchPosts())
      .catch((err) => console.log(`Patch req - ${err}`));
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
      if (props.image) {
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
        .then(async () => await refetchPosts())
        .catch((err) => console.log(`Delete req err - ${err}`));
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
  };

  // Dislikes a post
  const toggleDislike = async () => {
    const postReqPayload = {
      postID: props.postID,
      userID: Number(id),
    };

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
  };

  // Creates a comment
  const createComment = async () => {
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
        alert(
          "Could not upload the file. A file with the same name most likely already exists. Try to rename the file and see if the issues persists!"
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
      .then(async () => await refetchComments())
      .catch((err) => console.log(`Post req err - ${err}`));

    setImage("");
    setMessage("");
    setAddComment(false);
    setComments(true);
  };

  let count = 0;

  // Checks if post has been updated or not
  const time = props.createdAt === props.updatedAt ? props.createdAt : props.updatedAt;

  if (loading) return <Loading font="text-[1rem]" icon="w-[3rem] h-[3rem]" />;

  return editPost ? (
    <div className="flex flex-col bg-black bg-opacity-50 p-2 border border-white rounded-md">
      <div className="flex items-center">
        <label htmlFor="msg">Message:</label>
        <textarea
          name="msg"
          id="msg"
          defaultValue={props.message}
          onChange={(e) => setEditedMsg(e.target.value)}
          className="w-[20rem] h-[10rem] bg-transparent border border-white rounded-md ml-2"></textarea>
      </div>
      <div className="flex items-center">
        <p>Image:</p>
        <label htmlFor="img" className="flex ml-2 my-2 hover:cursor-pointer">
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
      <div className="flex self-center">
        <Button
          submit
          title="Submit"
          classes={!editedMsg && !editedImg && "pointer-events-none opacity-50"}
          onClick={() => {
            editPostReq();
            editedFileInputRef.current.value = null;
            setEditedImg(null);
            setEditedMsg("");
            setEditPost(false);
            setDeletedPostPic(false);
          }}
        />
        <Button title="Back" onClick={() => setEditPost(false)} />
      </div>
    </div>
  ) : (
    <div className={classes.post}>
      {(props.profile || admin) && (
        <div className="absolute top-5 right-5 hover:cursor-pointer" onClick={deleteReq}>
          <BsFillXCircleFill className="w-5 h-5 text-yellow-600" />
        </div>
      )}
      {props.profile && (
        <div
          className="absolute top-5 right-20 hover:cursor-pointer"
          onClick={() => setEditPost(true)}>
          <FaPencilAlt className="w-5 h-5 text-yellow-600" />
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
      <div className="w-full h-full flex justify-center items-center border-b border-white">
        <img
          src={props.profilePicture}
          alt="profilePic"
          className="w-auto h-auto max-w-full max-h-full rounded-lg"
        />
      </div>
      <div className="text-3xl col-start-2 col-end-4 border-b border-white w-full h-full flex justify-center items-center">
        <h1>
          {props.firstName} {props.lastName}
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
      <div className="flex items-center justify-center w-full h-full border-t border-white pt-2 relative">
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
          <div className="absolute flex flex-col w-[10rem] h-20 text-[0.6rem] p-2 bg-black border border-white rounded-md top-[4rem]">
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
          <div className="absolute flex flex-col justify-center items-center [&>*]:mb-2 w-[10rem] h-auto text-[0.5rem] p-2 bg-black z-50 border border-white rounded-md top-[4rem]">
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
          className="w-10 h-10 ml-2 hover:cursor-pointer text-yellow-600"
          onClick={toggleLike}
        />
      </div>
      <div className="flex items-center justify-center w-full h-full border-t border-white pt-2 relative">
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
          <div className="absolute flex flex-col w-[10rem] h-20 text-[0.6rem] p-2 bg-black border border-white rounded-md top-[4rem]">
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
          <div className="absolute flex flex-col justify-center items-center [&>*]:mb-2 w-[10rem] h-auto text-[0.5rem] p-2 bg-black z-50 border border-white rounded-md top-[4rem]">
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
          className="w-10 h-10 ml-2 rotate-180 hover:cursor-pointer text-yellow-600"
          onClick={toggleDislike}
        />
      </div>
      <div
        className="flex items-center justify-center w-full h-full border-t border-white pt-2 hover:cursor-pointer"
        onClick={() => setComments(!comments)}>
        <p className="mr-2">Comments{commentCount() > 0 && ` : ${commentCount()}`}</p>{" "}
        <FaComments className="w-10 h-10 text-yellow-600 ml-2" />
      </div>
      <div className="col-span-full w-full flex flex-col">
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
          <div onClick={() => setAddComment(!addComment)}>
            <Button
              classes="!border-none text-yellow-600 !bg-transparent"
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
            <Form className="flex flex-col mt-2 border border-white rounded-lg p-2 [&>*]:mt-2">
              <div className="flex items-center">
                <label htmlFor="message">Message:</label>
                <textarea
                  name="message"
                  id="message"
                  cols="30"
                  rows="10"
                  className="max-w-[20rem] max-h-[3rem] bg-transparent border border-white rounded-lg ml-2"
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
                title="Submit"
                submit
                classes={`self-center ${!message && !image && "pointer-events-none opacity-50"}`}
                onClick={() => {
                  createComment();
                  fileInputRef.current.value = null;
                }}
              />
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
