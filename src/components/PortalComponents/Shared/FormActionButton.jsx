import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function FormActionButton({ icon, onClick, signed }) {
  let style = `${
    signed ? "bg-blue-500 hover:bg-blue-400" : "bg-red-600 hover:bg-red-400"
  }  rounded-md  duration-500`;

  if (signed === null || signed === undefined) {
    style = "bg-blue-500 hover:bg-blue-400  rounded-md  duration-500";
  }

  return (
    <button onClick={onClick} className={`${style}`}>
      <FontAwesomeIcon className={"text-white px-3"} icon={icon} />
    </button>
  );
}
