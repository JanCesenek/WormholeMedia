import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./pages/root";
import Error from "./components/custom/error";
import Home from "./pages/home";
import { api } from "./core/api";
import UserLayout from "./pages/userLayout";
import LoggedIn from "./pages/loggedIn";
import Profile from "./pages/profile";
import NewsFeed from "./pages/newsFeed";
import Messages from "./pages/messages";
import Users from "./pages/users";
import { useUpdate } from "./hooks/use-update";

function App() {
  const { refetch: refUsers } = useUpdate("/users");
  const { refetch: refPosts } = useUpdate("/posts");
  const { refetch: refComments } = useUpdate("/comments");
  const { refetch: refLikes } = useUpdate("/likes");
  const { refetch: refDislikes } = useUpdate("/dislikes");
  const { refetch: refMessages } = useUpdate("/messages");
  const { refetch: refFriendList } = useUpdate("/friendList");
  const { refetch: refRequests } = useUpdate("/friendRequests");
  const { refetch: refBlockList } = useUpdate("/blockList");

  useEffect(() => {
    api
      .get("/users")
      .then(async () => {
        await refUsers();
      })
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/posts")
      .then(async () => {
        await refPosts();
      })
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/comments")
      .then(async () => {
        await refComments();
      })
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/likes")
      .then(async () => {
        await refLikes();
      })
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/dislikes")
      .then(async () => {
        await refDislikes();
      })
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/messages")
      .then(async () => {
        await refMessages();
      })
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/friendList")
      .then(async () => {
        await refFriendList();
      })
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/friendRequests")
      .then(async () => {
        await refRequests();
      })
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/blockList")
      .then(async () => {
        await refBlockList();
      })
      .catch((err) => console.log(`Get req err - ${err}`));
  }, []);

  const router = createBrowserRouter({
    basename: "/",
    children: [
      {
        path: "/",
        element: <RootLayout />,
        errorElement: <Error />,
        children: [
          { index: true, element: <Home /> },
          {
            path: "user",
            element: <UserLayout />,
            children: [
              { index: true, element: <LoggedIn /> },
              { path: "profile", element: <Profile /> },
              { path: "news-feed", element: <NewsFeed /> },
              { path: "messages", element: <Messages /> },
              { path: "users", element: <Users /> },
            ],
          },
        ],
      },
    ],
  });

  return <RouterProvider router={router} />;
}

export default App;
