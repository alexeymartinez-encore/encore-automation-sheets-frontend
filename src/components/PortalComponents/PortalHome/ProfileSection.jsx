import { use } from "framer-motion/client";
import { fetchUser } from "../../../util/fetching";
import ProfileItem from "./ProfileSectionComponents/ProfileItem";
import { Link } from "react-router-dom";

export default function ProfileSection() {
  const user = fetchUser();

  if (!user) {
    return <p>Loading user data...</p>;
  }

  return (
    <div className="bg-white shadow-xs rounded-lg p-5">
      <h1 className="md:text-2xl text-blue-500">Profile</h1>
      <div className="py-5 text-xs md:text-md">
        <ProfileItem desc={"Name:"}>
          {user.first_name} {user.last_name}
        </ProfileItem>
        <ProfileItem desc={"Employee Number:"}>
          {user.employee_number}
        </ProfileItem>
        <ProfileItem desc={"Position:"}>{user.position}</ProfileItem>
        <ProfileItem desc={"Cell Phone:"}>{user.cell_phone}</ProfileItem>
        <ProfileItem desc={"Email:"}>{user.email}</ProfileItem>
        <ProfileItem desc={"Reports to:"}>
          {user.manager_name !== "null" ? user.manager_name : "-"}
        </ProfileItem>
        {/* <div className="flex p-3 justify-between">
          <p>Password:</p>
          <Link
            to="/employee-portal/reset-password-request"
            className="bg-blue-500 text-white py-1 px-2 rounded-sm font-thin hover:bg-blue-400 transition duration-300"
          >
            Change Password
          </Link>
        </div> */}
      </div>
    </div>
  );
}
