import { Link } from "react-router-dom";
import FormActionButton from "./FormActionButton";
import { faFloppyDisk, faSignature } from "@fortawesome/free-solid-svg-icons";

export default function FormActionsButtons({
  handleSave,
  handleSign,
  signed,
  disabled,
  href,
  handleCopy,
  isSaving,
}) {
  const signed_text = signed ? "Unsign" : "Sign";

  return (
    <div className="flex gap-3 md:justify-between items-center">
      {disabled ? (
        <>
          <p className="bg-orange-500 text-white py-1 px-3 rounded-md">
            Timesheet has been approved & locked
          </p>
        </>
      ) : (
        <>
          <FormActionButton
            onClick={handleSave}
            icon={faFloppyDisk}
            disabled={disabled}
            text={"Save"}
            isSaving={isSaving}
          />
          <FormActionButton
            onClick={handleSign}
            icon={faSignature}
            signed={signed}
            text={signed_text}
            disabled={disabled}
            isSaving={isSaving}
          />
        </>
      )}
      <Link
        to={href}
        className="bg-blue-500 text-white py-1 rounded-md px-3 hover:bg-blue-400 transition duration-300"
      >
        + New
      </Link>
      <button
        onClick={handleCopy}
        className="bg-blue-500 text-white py-1 rounded-md px-3 hover:bg-blue-400 transition duration-300"
      >
        + Copy New
      </button>
    </div>
  );
}
