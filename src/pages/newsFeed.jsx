import React, { useEffect } from "react";
import Posts from "../components/posts";
import { useNavigate } from "react-router-dom";
import { useUpdate } from "../hooks/use-update";
import Loading from "../components/custom/loading";

const NewsFeed = () => {
  const { isLoading: usersLoading } = useUpdate("/users");
  const { isLoading: postsLoading } = useUpdate("/posts");
  const loading = usersLoading || postsLoading;

  const navigate = useNavigate();
  const loggedIn = localStorage.getItem("token");

  useEffect(() => {
    if (!loggedIn) navigate("/");
  }, []);

  if (loading) return <Loading font="text-[2rem]" icon="w-[5rem] h-[5rem]" />;

  return <Posts />;
};

export default NewsFeed;
