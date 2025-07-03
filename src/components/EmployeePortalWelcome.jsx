import Welcome from "../Shared/Welcome";
import portalImg from "../../assets/portal.jpg";

import EmployeeActions from "./EmployeeActions";

export default function EmployeePortalWelcome() {
  return (
    <>
      <Welcome
        img={portalImg}
        title="Manage your needs"
        subtitle="Welcome To Encore's Employee Portal"
      />
      <EmployeeActions />
    </>
  );
}
