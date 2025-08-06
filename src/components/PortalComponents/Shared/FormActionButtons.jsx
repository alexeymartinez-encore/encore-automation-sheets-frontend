import { Link } from "react-router-dom";
import FormActionButton from "./FormActionButton";
import { faFloppyDisk, faSignature } from "@fortawesome/free-solid-svg-icons";

export default function FormActionsButtons({
  handleSave,
  handleSign,
  signed,
  saved,
  href,
}) {
  const signed_text = signed ? "Unsign" : "Sign";
  return (
    <div className="flex gap-3 md:justify-between items-center">
      <FormActionButton
        onClick={handleSave}
        icon={faFloppyDisk}
        // signed={saved}
        text={"Save"}
      />
      <FormActionButton
        onClick={handleSign}
        icon={faSignature}
        signed={signed}
        text={signed_text}
      />
      <Link
        to={href}
        className="bg-blue-500 text-white py-1 rounded-md px-3 hover:bg-blue-400 transition duration-300"
      >
        + New
      </Link>
    </div>
  );
}
