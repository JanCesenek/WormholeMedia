import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../core/api";
import { useUpdate } from "../hooks/use-update";
import {
  GiCrossedSwords,
  GiCheckMark,
  GiAlienSkull,
  GiAges,
  GiSuitcase,
  GiRingedPlanet,
  GiThreeFriends,
  GiClusterBomb,
} from "react-icons/gi";
import supabase from "../core/supabase";
import { BsFillFileImageFill, BsGenderAmbiguous } from "react-icons/bs";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaBirthdayCake, FaSpaceShuttle } from "react-icons/fa";
import { v4 as uuid } from "uuid";
import Loading from "./custom/loading";
import { NotificationContext } from "../context/NotificationContext";

// User's personal details

const PersonalDetails = (props) => {
  const { notifyContext, setStatus } = useContext(NotificationContext);

  const { data, refetch, isLoading } = useUpdate("/users");
  const { data: friendListData, isLoading: loadingFriendList } = useUpdate("/friendList");
  const [changeOccupation, setChangeOccupation] = useState(false);
  const [changeOrigin, setChangeOrigin] = useState(false);
  const [changePic, setChangePic] = useState(false);
  const [occupation, setOccupation] = useState(props.occupation);
  const [origin, setOrigin] = useState(props.origin);
  const [friendList, setFriendList] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const malePic =
    "https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/imgs/userPics/maleDefaultPic.jpg";
  const femalePic =
    "https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/imgs/userPics/femaleDefaultPic.jfif";
  const defaultPic = props.gender === "M" ? malePic : femalePic;
  const token = localStorage.getItem("token");
  const [editedPic, setEditedPic] = useState(null);
  const inputValueRef = useRef(null);
  const curUser = localStorage.getItem("curUser");
  const curUserData = props.stranger ? props.stranger : data?.find((el) => el.username === curUser);
  const admin = curUserData?.admin;
  const uniqueID = uuid();

  useEffect(() => {
    return () => {
      if (editedPic) {
        URL.revokeObjectURL(editedPic.preview);
      }
    };
  }, [editedPic]);

  // Removes a token upon logging out
  const removeBearerToken = () => {
    delete api.defaults.headers.common["Authorization"];
  };

  // Changes input:file value
  const handleFileChange = (e) => {
    console.log(e.target.files[0]);
    setEditedPic(e.target.files[0]);
  };

  // Delete req for deleting a user
  const deleteUser = async (e) => {
    if (window.confirm("Really wanna delete your account?")) {
      setSubmitting(true);
      if (props.profilePicture !== malePic && props.profilePicture !== femalePic) {
        const { data } = await supabase.storage.from("imgs").list("userPics");
        const curFile = data.find((el) => props.profilePicture.includes(el.name));
        const { data: deletedData, error: deletedError } = await supabase.storage
          .from("imgs")
          .remove([`userPics/${curFile.name}`]);

        if (deletedError) {
          console.log("Could not remove profile pic...", deletedError);
        } else {
          console.log("Profile pic removed successfully...", deletedData);
        }
      }
      await api
        .delete(`/users/${curUser}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(async () => {
          await refetch();
          removeBearerToken();
          localStorage.clear();
          setStatus("success");
          notifyContext(
            <div className="flex items-center">
              <GiClusterBomb className="mr-2" /> <span>Account deleted!</span>
            </div>,
            "logout"
          );
          navigate("/");
        })
        .catch((err) => {
          console.log(`Delete req err - ${err}`);
          setStatus("error");
          notifyContext(
            <div className="flex items-center">
              <GiRadioactive className="mr-2" /> <span>Could not delete account!</span>
            </div>,
            "error"
          );
        })
        .finally(() => {
          setSubmitting(false);
        });
    } else e.preventDefault();
  };

  // User can choose to edit occupation, origin or profile picture
  const editReq = async (value) => {
    setSubmitting(true);
    if (value.profilePicture) {
      if (props.profilePicture !== malePic && props.profilePicture !== femalePic) {
        const { data } = await supabase.storage.from("imgs").list("userPics");
        const curFile = data.find((el) => props.profilePicture.includes(el.name));
        const { data: deletedData, error: deletedError } = await supabase.storage
          .from("imgs")
          .remove([`userPics/${curFile.name}`]);

        if (deletedError) {
          console.log("Failed to delete profile pic...", deletedError);
        } else {
          console.log("Old profile pic deleted successfully...", deletedData);
        }
      }
      const { data, error } = await supabase.storage
        .from("imgs")
        .upload(`userPics/${uniqueID}`, editedPic, {
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
    }
    await api
      .patch(`/users/${curUser}`, value, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(async () => {
        await refetch();
        setStatus("success");
        notifyContext(
          <div className="flex items-center">
            <FaSpaceShuttle className="mr-2" /> <span>Changes saved!</span>
          </div>,
          "success"
        );
      })
      .catch((err) => {
        console.log(`Patch req - ${err}`);
        setStatus("error");
        notifyContext(
          <div className="flex items-center">
            <GiRadioactive className="mr-2" /> <span>Could not save changes!</span>
          </div>,
          "error"
        );
      })
      .finally(() => {
        inputValueRef.current.value = null;
        setEditedPic(null);
        setChangePic(false);
        setSubmitting(false);
      });
  };

  // Count age by date of birth
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

  // Count the number of friends
  const friendListCount = () => {
    let count = 0;
    friendListData?.map((el) => {
      if (el.firstUser === curUserData.id || el.secondUser === curUserData.id) count++;
    });
    return count;
  };

  const validOccupation =
    occupation?.length >= 2 && occupation?.length <= 30 && /^[A-Za-z\s]*$/.test(occupation);

  const validOrigin = origin?.length >= 2 && origin?.length <= 30 && /^[A-Za-z\s]*$/.test(origin);

  const loading = isLoading || loadingFriendList;

  if (loading) return <Loading />;

  return (
    <div
      className={`shadow-lg relative flex flex-col w-[min(90%,40rem)] items-center mt-8 p-10 bg-gradient-to-b from-black/80 via-black/70 to-fuchsia-800/60 rounded-md border border-fuchsia-600/20 ${
        props.admin ? "shadow-fuchsia-600" : "shadow-fuchsia-400"
      } ${submitting && "opacity-70 pointer-events-none"} `}>
      <div className={`flex flex-col w-full`}>
        <div className="flex items-center justify-between w-full min-h-[8rem]">
          <h1 className="text-3xl px-3 ml-5">
            {props.firstName} {props.lastName}
          </h1>
          <div className="w-[10rem] h-[10rem]">
            <img
              src={props.profilePicture ? props.profilePicture : defaultPic}
              alt="Profile pic"
              className={`max-w-full max-h-full rounded-md ${
                props.stranger ? "pointer-events-none" : "hover:cursor-pointer"
              }`}
              onClick={() => setChangePic(!changePic)}
            />
          </div>
        </div>
        {changePic && !props.stranger && (
          <div className="flex mt-16 self-end bg-black/30">
            <label htmlFor="pic" className="flex w-[10rem] text-[0.7rem] hover:cursor-pointer">
              <BsFillFileImageFill /> Upload image {editedPic && "uploaded img"}
            </label>
            <input
              type="file"
              name="pic"
              id="pic"
              size="10"
              className="hidden"
              onChange={handleFileChange}
              ref={inputValueRef}
            />
            {editedPic && (
              <AiFillCloseCircle
                className="w-3 h-3 hover:cursor-pointer mr-2"
                onClick={() => {
                  inputValueRef.current.value = null;
                  setEditedPic(false);
                }}
              />
            )}
            <GiCheckMark
              className="w-3 h-3 hover:cursor-pointer"
              onClick={() => {
                editReq({
                  profilePicture: editedPic
                    ? `https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/imgs/userPics/${uniqueID}`
                    : defaultPic,
                });
              }}
            />
          </div>
        )}
        {!props.stranger && !admin && (
          <div
            className="absolute top-0 right-0 mr-5 mt-5 hover:cursor-pointer"
            onClick={deleteUser}>
            <GiCrossedSwords className="w-5 h-5 text-fuchsia-300" />
          </div>
        )}
      </div>
      <div className="flex flex-col items-center mt-24 w-full">
        <div className="flex flex-col items-center pb-2 w-full [&>*]:my-2">
          <p className="flex items-center justify-between w-4/5">
            <GiAlienSkull className="w-10 h-10" />
            <span>{props.race}</span>
          </p>
          <p className="flex items-center justify-between w-4/5">
            <GiAges className="w-10 h-10" />
            <span>{getAge(props.birthDate)} y.o.</span>
          </p>
          <p className="flex items-center justify-between w-4/5">
            <GiSuitcase className="w-10 h-10" />
            {changeOccupation && !props.stranger ? (
              <span className="flex">
                <input
                  type="text"
                  className="bg-transparent border border-white"
                  value={occupation}
                  onChange={(e) => {
                    setOccupation(e.target.value);
                  }}
                />
                <GiCheckMark
                  className={`w-5 h-5 hover:cursor-pointer ${
                    !validOccupation && "pointer-events-none opacity-50"
                  }`}
                  onClick={() => {
                    editReq({ occupation });
                    setOccupation(props.occupation);
                    setChangeOccupation(false);
                  }}
                />{" "}
              </span>
            ) : (
              <span
                className={`flex ${
                  props.stranger ? "pointer-events-none" : "hover:cursor-pointer"
                }`}
                onClick={() => setChangeOccupation(true)}>
                {props.occupation}
              </span>
            )}
          </p>
          <p className="flex items-center justify-between w-4/5">
            <GiRingedPlanet className="w-10 h-10" />
            {changeOrigin && !props.stranger ? (
              <span className="flex">
                <input
                  type="text"
                  className="bg-transparent border border-white"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
                <GiCheckMark
                  className={`w-5 h-5 hover:cursor-pointer ${
                    !validOrigin && "pointer-events-none opacity-50"
                  }`}
                  onClick={() => {
                    editReq({ origin });
                    setOrigin(props.origin);
                    setChangeOrigin(false);
                  }}
                />{" "}
              </span>
            ) : (
              <span
                className={`flex ${
                  props.stranger ? "pointer-events-none" : "hover:cursor-pointer"
                }`}
                onClick={() => setChangeOrigin(true)}>
                {props.origin}{" "}
              </span>
            )}
          </p>
          <p className="flex items-center justify-between w-4/5">
            <FaBirthdayCake className="w-10 h-10" />
            <span>{props.birthDate?.slice(0, 10)}</span>
          </p>
          <p className="flex items-center justify-between w-4/5">
            <BsGenderAmbiguous className="w-10 h-10" />
            <span>{props.gender === "M" ? "Male" : "Female"}</span>
          </p>
          <p className="flex items-center justify-between w-4/5">
            <GiThreeFriends className="w-10 h-10" />
            <span
              className={friendListCount() > 0 ? "hover:cursor-pointer" : undefined}
              onClick={() => setFriendList(!friendList)}>
              {friendListCount()}
            </span>
          </p>
        </div>
        {friendList && friendListCount() > 0 && (
          <div className="flex flex-col border border-black/10 rounded-md bg-fuchsia-800/40 mt-5 mr-5 !w-[20rem] justify-self-end p-5 shadow-md shadow-black">
            {data?.map((el) => {
              const friends = friendListData?.find(
                (arg) =>
                  (arg.firstUser === el.id && arg.secondUser === curUserData.id) ||
                  (arg.firstUser === curUserData.id && arg.secondUser === el.id)
              );
              if (friends && el.id !== curUserData.id) {
                return (
                  <div
                    key={el.id}
                    className="flex items-center justify-between my-2 p-2 bg-black/50 bg-opacity-20 rounded-md">
                    <img
                      src={el.profilePicture}
                      alt="profile pic"
                      className="w-auto h-auto max-w-[5rem] max-h-[5rem]"
                    />
                    <p>
                      {el.firstName} {el.lastName}
                    </p>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalDetails;
