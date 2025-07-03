import { Link } from "react-router-dom";

export default function SectionHeader({ section, link }) {
  return (
    <div className="flex justify-between p-5 bg-white h-full shadow-md rounded-md">
      <h1 className="md:text-2xl text-blue-500">{section}</h1>
      <Link
        to={link}
        className="flex justify-center text-xs md:text-sm items-center bg-blue-500 text-white px-2 md:px-5 rounded-sm hover:bg-blue-400 transition duration-300"
      >
        Create New
      </Link>
    </div>
  );
}
