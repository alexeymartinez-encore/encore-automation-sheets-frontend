import { NavLink } from "react-router-dom";
import encoreLogo from "../../assets/Encore-Automation-Logo.jpg";
export default function NavigationLogo() {
  return (
    <NavLink to="/employee-portal">
      <img
        src={encoreLogo}
        alt="Encore Automation Logo"
        className="h-40 rounded-sm"
      />
    </NavLink>
  );
}
