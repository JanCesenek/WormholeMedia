import React from "react";
import Post from "../components/post";
import { useUpdate } from "../hooks/use-update";
import Loading from "./custom/loading";

const Posts = (props) => {
  const { data: userList, isLoading: usersLoading } = useUpdate("/users");
  const curUsername = localStorage.getItem("curUser");
  const currentUser = props.stranger
    ? props.stranger
    : userList?.find((el) => el.username === curUsername);
  const loggedInUser = userList?.find((el) => el.username === curUsername);
  const id = currentUser?.id;
  const { data: posts, isLoading: postsLoading } = useUpdate("/posts");
  const { data: blockList, isLoading: blocksLoading } = useUpdate("/blockList");

  const loading = usersLoading || postsLoading || blocksLoading;

  if (loading) return <Loading font="text-[2rem]" icon="w-[5rem] h-[5rem]" />;

  return props.profile ? (
    <div className="w-[40rem] mt-10 mb-10">
      {posts?.map((el) => {
        if (el.userID === Number(id))
          return (
            <Post
              key={el.id}
              image={el.image}
              message={el.message}
              createdAt={el.createdAt}
              updatedAt={el.updatedAt}
              postID={el.id}
              profilePicture={currentUser?.profilePicture}
              firstName={currentUser?.firstName}
              lastName={currentUser?.lastName}
              profile={props.stranger ? false : true}
            />
          );
      })}
    </div>
  ) : (
    <div className="w-[40rem] mt-10">
      {posts?.map((el) => {
        const userMatch = userList?.find((user) => user.id === el.userID);
        const blockedPost = blockList?.find(
          (block) =>
            (block.blocked === el.userID && block.blocker === loggedInUser.id) ||
            (block.blocker === el.userID && block.blocked === loggedInUser.id)
        );
        if (!blockedPost) {
          return (
            <Post
              key={el.id}
              image={el.image}
              message={el.message}
              createdAt={el.createdAt}
              updatedAt={el.updatedAt}
              postID={el.id}
              profilePicture={userMatch?.profilePicture}
              firstName={userMatch?.firstName}
              lastName={userMatch?.lastName}
            />
          );
        }
      })}
    </div>
  );
};

export default Posts;
