import { NavLink } from "react-router-dom";

export default function AdminNavLink({ to, children, end }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? "text-blue-500 bg-white w-[10rem]  py-2 rounded-lg flex items-center justify-center text-[0.8rem] md:text-sm"
          : " text-blue-900 w-[10rem]  py-2 rounded-lg flex items-center text-[0.8rem] md:text-sm hover:bg-white hover:text-blue-500 transition duration-300 justify-center"
      }
      end={end}
    >
      {children}
    </NavLink>
  );
}
