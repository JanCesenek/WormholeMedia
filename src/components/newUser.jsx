import React, { useState, useEffect, useRef, useContext } from "react";
import { Form, useNavigate } from "react-router-dom";
import Button from "./custom/Button";
import { api } from "../core/api";
import supabase from "../core/supabase";
import UseInput from "../hooks/use-input";
import { AiFillCloseCircle } from "react-icons/ai";
import { BsFillEyeFill, BsFillEyeSlashFill, BsFillFileImageFill } from "react-icons/bs";
import { useUpdate } from "../hooks/use-update";
import Submitting from "./custom/submitting";
import { v4 as uuid } from "uuid";
import { FaSpaceShuttle } from "react-icons/fa";
import { GiRadioactive } from "react-icons/gi";
import { NotificationContext } from "../context/NotificationContext";

const NewUser = (props) => {
  const { notifyContext, setStatus } = useContext(NotificationContext);

  // Variables ensuring correct validation in frontend, won't allow user to submit a form until conditions are met
  const {
    value: firstNameValue,
    isValid: firstNameIsValid,
    hasError: firstNameHasError,
    changeHandler: firstNameChangeHandler,
    blurHandler: firstNameBlurHandler,
    reset: firstNameReset,
  } = UseInput((value) => /^[a-zA-Z]+$/.test(value) && value.length >= 2 && value.length <= 30);

  const {
    value: lastNameValue,
    isValid: lastNameIsValid,
    hasError: lastNameHasError,
    changeHandler: lastNameChangeHandler,
    blurHandler: lastNameBlurHandler,
    reset: lastNameReset,
  } = UseInput((value) => /^[a-zA-Z]+$/.test(value) && value.length >= 2 && value.length <= 30);

  const {
    value: usernameValue,
    isValid: usernameIsValid,
    hasError: usernameHasError,
    changeHandler: usernameChangeHandler,
    blurHandler: usernameBlurHandler,
    reset: usernameReset,
  } = UseInput(
    (value) =>
      value.length >= 6 &&
      value.length <= 30 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /^[A-Za-z0-9]*$/.test(value)
  );

  const {
    value: passwordValue,
    isValid: passwordIsValid,
    hasError: passwordHasError,
    changeHandler: passwordChangeHandler,
    blurHandler: passwordBlurHandler,
    reset: passwordReset,
  } = UseInput(
    (value) =>
      value.length >= 8 &&
      value.length <= 16 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[$&+,:;=?@#|'"<>.⌃*()%!-_]/.test(value)
  );

  const {
    value: birthDateValue,
    isValid: birthDateIsValid,
    hasError: birthDateHasError,
    changeHandler: birthDateChangeHandler,
    blurHandler: birthDateBlurHandler,
    reset: birthDateReset,
  } = UseInput((value) => value);

  const {
    value: raceValue,
    isValid: raceIsValid,
    hasError: raceHasError,
    changeHandler: raceChangeHandler,
    blurHandler: raceBlurHandler,
    reset: raceReset,
  } = UseInput((value) => /^[a-zA-Z]+$/.test(value) && value.length >= 2 && value.length <= 30);

  const {
    value: occupationValue,
    isValid: occupationIsValid,
    hasError: occupationHasError,
    changeHandler: occupationChangeHandler,
    blurHandler: occupationBlurHandler,
    reset: occupationReset,
  } = UseInput((value) => /^[a-zA-Z]+$/.test(value) && value.length >= 2 && value.length <= 30);

  const {
    value: originValue,
    isValid: originIsValid,
    hasError: originHasError,
    changeHandler: originChangeHandler,
    blurHandler: originBlurHandler,
    reset: originReset,
  } = UseInput((value) => /^[a-zA-Z]+$/.test(value) && value.length >= 2 && value.length <= 30);

  const [profilePic, setProfilePic] = useState(null);
  const [gender, setGender] = useState("M");
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const { refetch } = useUpdate("/users");

  const addBearerToken = (token) => {
    if (!token) {
      console.log("Token can't be undefined or null.");
      return;
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  useEffect(() => {
    return () => {
      if (profilePic) {
        URL.revokeObjectURL(profilePic.preview);
      }
    };
  }, [profilePic]);

  const handleFileChange = (e) => {
    console.log(e.target.files[0]);
    setProfilePic(e.target.files[0]);
  };

  const resetForm = () => {
    firstNameReset();
    lastNameReset();
    usernameReset();
    passwordReset();
    birthDateReset();
    raceReset();
    occupationReset();
    originReset();
    setGender("M");
  };

  const getAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const createNewUser = async (e) => {
    e.preventDefault();

    const uniqueID = uuid();
    const firstName = firstNameValue[0]?.toUpperCase() + firstNameValue?.slice(1).toLowerCase();
    const lastName = lastNameValue[0]?.toUpperCase() + lastNameValue?.slice(1).toLowerCase();
    const username = usernameValue[0]?.toUpperCase() + usernameValue?.slice(1).toLowerCase();

    if (getAge(birthDateValue) > 105) {
      setStatus("error");
      notifyContext(
        <div className="flex items-center">
          <GiRadioactive className="mr-2" />{" "}
          <span>You can't be that old! There is no bigger number than 105!</span>
        </div>,
        "error"
      );
      resetForm();
      return;
    }

    const defaultPic =
      gender === "M"
        ? "https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/imgs/userPics/maleDefaultPic.jpg"
        : "https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/imgs/userPics/femaleDefaultPic.jfif";

    const handleUpload = async () => {
      const { data, error } = await supabase.storage
        .from("imgs")
        .upload(`userPics/${uniqueID}`, profilePic, {
          cacheControl: "3600",
          upsert: false,
        });

      const { dataGet, errorGet } = await supabase.storage.from("imgs").list("userPics");

      if (error) {
        console.log("Error uploading file...", error);
        setStatus("error");
        notifyContext(
          <div className="flex items-center">
            <GiRadioactive className="mr-2" />{" "}
            <span>A file with that name already exists! Couldn't upload. Try again...</span>
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
    profilePic && handleUpload();

    const postReqPayload = {
      firstName,
      lastName,
      username,
      password: passwordValue,
      gender,
      race: raceValue,
      birthDate: new Date(birthDateValue),
      occupation: occupationValue,
      profilePicture: profilePic
        ? `https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/imgs/userPics/${uniqueID}`
        : defaultPic,
      origin: originValue,
    };
    setIsSubmitting(true);
    await api
      .post("/signup", postReqPayload)
      .then(async (res) => {
        await refetch();
        const token = res.data.token;
        addBearerToken(token);
        localStorage.setItem("token", token);
        localStorage.setItem("curUser", username);
        resetForm();
        fileInputRef.current.value = null;
        navigate(`${username}/profile`);
        setIsSubmitting(false);
        setStatus("success");
        setTimeout(() => {
          notifyContext(
            <div className="flex items-center">
              <FaSpaceShuttle className="mr-2" />{" "}
              <span>Welcome to the enlightened club, {username}!</span>
            </div>,
            "login"
          );
        }, 500);
      })
      .catch((err) => {
        console.log(`Post req err - ${err}`);
        setIsSubmitting(false);
        setStatus("error");
        notifyContext(
          <div className="flex items-center">
            <GiRadioactive className="mr-2" /> <span>Invalid credentials!</span>
          </div>,
          "iris"
        );
      });
  };

  const validForm =
    firstNameIsValid &&
    lastNameIsValid &&
    usernameIsValid &&
    passwordIsValid &&
    birthDateIsValid &&
    raceIsValid &&
    occupationIsValid &&
    originIsValid;

  return (
    <div className="flex flex-col items-center w-[min(40rem,90%)]">
      <div className={`flex flex-col items-center w-full ${isSubmitting && "hidden"}`}>
        <div className="text-[1.2rem] my-5 bg-black/70 px-5 py-2 rounded-md shadow-md shadow-fuchsia-600/50 w-full">
          <h2 className="text-[1.5rem] text-center text-fuchsia-400">Validation rules:</h2>
          <p>
            First name, Last name, Race, Occupation, Place of origin: 2-30 characters, letters only
          </p>
          <p>Username: 6-30 characters, upper+lowercase and at least one number</p>
          <p>
            Password: 8-16 characters, must contain lower+uppercase, number and a special character
          </p>
          <p>Profile pic: voluntary, if none provided, default will be used based on gender</p>
          <p className="text-fuchsia-600 font-bold">
            Note: It won't be possible to submit the form until the conditions are met!
          </p>
        </div>
        <div className="rounded-md my-5 bg-black/70 text-[1.5rem] shadow-lg shadow-fuchsia-600/50 border border-fuchsia-600/20 w-full">
          <Form className="flex flex-col items-start [&>*]:my-2 p-5">
            <div className="flex">
              <label htmlFor="firstName" className="min-w-[15rem] ml-2">
                First name:
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={firstNameValue}
                onChange={firstNameChangeHandler}
                onBlur={firstNameBlurHandler}
                className={`bg-transparent shadow-md shadow-fuchsia-600/50 border border-fuchsia-600/20 focus:outline-none w-1/2 ${
                  firstNameHasError && "!border-fuchsia-800 animate-pulse"
                }`}
              />
            </div>
            <div className="flex">
              <label htmlFor="lastName" className="min-w-[15rem] ml-2">
                Last name:
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={lastNameValue}
                onChange={lastNameChangeHandler}
                onBlur={lastNameBlurHandler}
                className={`bg-transparent shadow-md shadow-fuchsia-600/50 border border-fuchsia-600/20 focus:outline-none w-1/2 ${
                  lastNameHasError && "!border-fuchsia-800 animate-pulse"
                }`}
              />
            </div>
            <div className="flex">
              <label htmlFor="username" className="min-w-[15rem] ml-2">
                Username:
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={usernameValue}
                onChange={usernameChangeHandler}
                onBlur={usernameBlurHandler}
                className={`bg-transparent shadow-md shadow-fuchsia-600/50 border border-fuchsia-600/20 focus:outline-none w-1/2 ${
                  usernameHasError && "!border-fuchsia-800 animate-pulse"
                }`}
              />
            </div>
            <div className="flex">
              <label htmlFor="password" className="min-w-[15rem] ml-2">
                Password:
              </label>
              <input
                type={passwordVisibility ? "text" : "password"}
                id="password"
                name="password"
                value={passwordValue}
                onChange={passwordChangeHandler}
                onBlur={passwordBlurHandler}
                className={`bg-transparent shadow-md shadow-fuchsia-600/50 border border-fuchsia-600/20 focus:outline-none w-1/2 ${
                  passwordHasError && "!border-fuchsia-800 animate-pulse"
                }`}
              />
              {passwordVisibility ? (
                <BsFillEyeSlashFill
                  className="w-5 h-5 hover:cursor-pointer self-center ml-2"
                  onClick={() => setPasswordVisibility(!passwordVisibility)}
                />
              ) : (
                <BsFillEyeFill
                  className="w-5 h-5 hover:cursor-pointer self-center ml-2"
                  onClick={() => setPasswordVisibility(!passwordVisibility)}
                />
              )}
            </div>
            <div className="flex">
              <label htmlFor="birthDate" className="min-w-[15rem] ml-2">
                Birth date:
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={birthDateValue}
                onChange={birthDateChangeHandler}
                onBlur={birthDateBlurHandler}
                className={`bg-transparent shadow-md shadow-fuchsia-600/50 border border-fuchsia-600/20 focus:outline-none w-1/2 ${
                  birthDateHasError && "!border-fuchsia-800 animate-pulse"
                }`}
              />
            </div>
            <div className="flex">
              <label htmlFor="race" className="min-w-[15rem] ml-2">
                Race:
              </label>
              <input
                type="text"
                id="race"
                name="race"
                value={raceValue}
                onChange={raceChangeHandler}
                onBlur={raceBlurHandler}
                className={`bg-transparent shadow-md shadow-fuchsia-600/50 border border-fuchsia-600/20 focus:outline-none w-1/2 ${
                  raceHasError && "!border-fuchsia-800 animate-pulse"
                }`}
              />
            </div>
            <div className="flex">
              <label htmlFor="occupation" className="min-w-[15rem] ml-2">
                Occupation:
              </label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={occupationValue}
                onChange={occupationChangeHandler}
                onBlur={occupationBlurHandler}
                className={`bg-transparent shadow-md shadow-fuchsia-600/50 border border-fuchsia-600/20 focus:outline-none w-1/2 ${
                  occupationHasError && "!border-fuchsia-800 animate-pulse"
                }`}
              />
            </div>
            <div className="flex items-center max-w-[30rem]">
              <p className="min-w-[15rem] ml-2">Profile picture:</p>
              <label
                htmlFor="pic"
                className="flex items-center w-[15rem] text-[1rem] hover:cursor-pointer">
                <BsFillFileImageFill /> Upload image {profilePic && "uploaded img"}
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
              {profilePic && (
                <AiFillCloseCircle
                  className="w-3 h-3 hover:cursor-pointer mr-2"
                  onClick={() => {
                    fileInputRef.current.value = null;
                    setProfilePic(null);
                  }}
                />
              )}
            </div>
            <div className="flex">
              <label htmlFor="origin" className="min-w-[15rem] ml-2">
                Place of origin:
              </label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={originValue}
                onChange={originChangeHandler}
                onBlur={originBlurHandler}
                className={`bg-transparent shadow-md shadow-fuchsia-600/50 border border-fuchsia-600/20 focus:outline-none w-1/2 ${
                  originHasError && "!border-fuchsia-800 animate-pulse"
                }`}
              />
            </div>
            <div className="flex">
              <label htmlFor="gender" className="min-w-[15rem] ml-2">
                Gender:
              </label>
              <select
                name="gender"
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="shadow-md shadow-fuchsia-600/50 border border-fuchsia-600/20 focus:outline-none bg-transparent">
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            </div>
            <Button
              title={isSubmitting ? "Creating..." : "Create New User"}
              classes={`self-center ${!validForm && "pointer-events-none opacity-50"} ${
                isSubmitting && "pointer-events-none opacity-50"
              }`}
              onClick={createNewUser}
            />
          </Form>
        </div>
        <p className="my-5 text-fuchsia-400 underline hover:cursor-pointer" onClick={props.link}>
          Already have an account? Click here to log in.
        </p>
      </div>
      {isSubmitting && <Submitting />}
    </div>
  );
};

export default NewUser;
