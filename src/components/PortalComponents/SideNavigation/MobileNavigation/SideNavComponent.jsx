import LogoutButton from "../Shared/LogoutButton";
import NavIcon from "./NavIcon";
import NavIconsCard from "./NavIconsCard";
import {
  faHome,
  faSheetPlastic,
  faFileInvoiceDollar,
  faCalendarDays,
  faUserTie,
  faClipboardUser,
} from "@fortawesome/free-solid-svg-icons";
import OuterCard from "./OuterCard";

export default function SideNavComponent({ onClick, isExpanded, padding }) {
  const role_id = localStorage.getItem("role_id");

  return (
    <OuterCard padding={padding}>
      <NavIconsCard padding={padding}>
        <NavIcon
          icon={faHome}
          link="/employee-portal/dashboard"
          isExpanded={isExpanded}
        >
          {isExpanded ? "Home" : ""}
        </NavIcon>
        <NavIcon
          icon={faSheetPlastic}
          link="/employee-portal/dashboard/timesheets"
          isExpanded={isExpanded}
        >
          {isExpanded ? "Timesheets" : ""}
        </NavIcon>
        <NavIcon
          icon={faFileInvoiceDollar}
          link="/employee-portal/dashboard/expenses"
          isExpanded={isExpanded}
        >
          {isExpanded ? "Expenses" : ""}
        </NavIcon>
        <NavIcon
          icon={faCalendarDays}
          link="/employee-portal/dashboard/events"
          isExpanded={isExpanded}
        >
          {isExpanded ? "Events" : ""}
        </NavIcon>
        {role_id === "2" && (
          <NavIcon
            icon={faClipboardUser}
            link="/employee-portal/dashboard/manager"
            isExpanded={isExpanded}
          >
            {isExpanded ? "Manager" : ""}
          </NavIcon>
        )}
        {role_id === "3" && (
          <NavIcon
            icon={faUserTie}
            link="/employee-portal/dashboard/admin"
            isExpanded={isExpanded}
          >
            {isExpanded ? "Admin" : ""}
          </NavIcon>
        )}
        <LogoutButton onClick={onClick} expanded={isExpanded} />
      </NavIconsCard>
    </OuterCard>
  );
}
