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

  // Refetch all data every 2 seconds to enable live messaging
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

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <Error />,
      children: [
        // Home page when the user is not logged in - has either LogIn or SignUp, if there is a token present, redirect user to his profile
        { index: true, element: <Home /> },
        {
          path: "user",
          element: <UserLayout />,
          children: [
            // Redirecting page checking for loggedIn state, if there is a token present, redirect user to his profile, otherwise redirect to Home page
            { index: true, element: <LoggedIn /> },
            // User profile, where he can see his own profile, edit some personal details and CRUD his own posts
            { path: "profile", element: <Profile /> },
            // News Feed page, where user can see all posts, except users he has blocked/has been blocked by
            { path: "news-feed", element: <NewsFeed /> },
            // Users page, where user can search for all users in the DB (regular users, users in friend list, users he's blocked and users he's been blocked by have all different colors) and click on any of them (except the ones he's been blocked by) to display their profile and see their info and posts
            { path: "users", element: <Users /> },
            // Messages page, where user can send messages to either himself or any other users that are in his friend list
            { path: "messages", element: <Messages /> },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
