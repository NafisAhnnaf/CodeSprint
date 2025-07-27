import React, { useEffect, useState } from "react";
import Request from "../composables/Request";
import Heading from "../components/Heading";
import Subheading from "../components/Subheading";
import Muted from "../components/Muted";
import Unmuted from "../components/Unmuted";
import Button from "../components/Button";
import useAuth from "../auth/useAuth";
const Profile = () => {
  const [user, setUser] = useState({
    username: "",
    _id: "",
    email: "",
  });
  const { logout } = useAuth();
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await Request.get("/api/auth/profile");
        setUser(res.user);
        console.log(res.user);
      } catch (err) {
        console.log(err);
      }
    };
    fetchProfile();
  }, []);
  return (
    <div className="p-5 flex flex-col h-[75vh] justify-center items-center">
      <Heading content={"My Profile"}></Heading>
      <div className="max-w-2xl mx-auto bg-white rounded-lg p-5 flex flex-col items-center w-full space-y-8 mt-5">
        <Subheading style={"self-center"} content={"Basic Info"}></Subheading>
        <div className="grid grid-cols-[25%_75%] space-y-2">
          <Muted content={"ID"}></Muted>
          <Unmuted content={user._id}></Unmuted>
          <Muted content={"Name"}></Muted>
          <Unmuted content={user.username}></Unmuted>
          <Muted content={"Email"}></Muted>
          <Unmuted content={user.email}></Unmuted>
          <Muted content={"Role"}></Muted>
          <Unmuted content={"Admin"}></Unmuted>
        </div>
        <div className="flex justify-center">
          <Button
            label={"Logout"}
            bg="danger"
            onClick={() => logout()}
          ></Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
