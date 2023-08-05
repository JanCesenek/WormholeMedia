import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/login";
import NewUser from "../components/newUser";
import { GiAnubis } from "react-icons/gi";

// Default page when user is not logged in, he can either log in with existing details or create a new account

const Home = () => {
  const [hasAccount, setHasAccount] = useState(true);
  const loggedIn = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (loggedIn) navigate("user/profile");
  }, []);

  return (
    <div className="flex flex-col items-center bg-black bg-opacity-70 min-h-screen mx-0 2xl:mx-60">
      <div className="flex text-[3rem] font-[Audiowide,cursive] font-bold border border-white rounded-2xl bg-black bg-opacity-40 p-2 mt-[1%]">
        <h1>Wormhole Media</h1>
        <GiAnubis className="w-20 h-20 ml-2" />
      </div>
      {/* logIn or signUp state, depending on user's choice */}
      {hasAccount ? (
        <Login link={() => setHasAccount(false)} />
      ) : (
        <NewUser link={() => setHasAccount(true)} />
      )}
    </div>
  );
};

export default Home;
