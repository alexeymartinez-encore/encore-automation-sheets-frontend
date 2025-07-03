import { Link } from "react-router-dom";

export default function NavigationLinks() {
  const navStyle =
    // "text-blue-600 my-2 md:my-0  md:mx-2 text-xl transform duration-300 font-thin";
    "hover:text-blue-600 my-2 md:my-0  md:mx-2 text-xl transform duration-300 font-thin";

  return (
    <>
      <Link to="/employee-portal" className={navStyle}>
        Login
      </Link>
      <Link to="/employee-portal/signup" className={navStyle}>
        Sign Up
      </Link>
    </>
  );
}
