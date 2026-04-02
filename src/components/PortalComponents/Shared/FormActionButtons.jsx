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
  const secondaryBtnStyles =
    "inline-flex justify-center items-center w-full sm:w-auto sm:min-w-[6.5rem] h-10 bg-blue-500 text-white rounded-md text-xs sm:text-sm px-3 hover:bg-blue-400 transition duration-300";

  return (
    <div className="w-full xl:w-auto xl:ml-auto">
      {disabled && (
        <p className="bg-orange-500 text-white py-1.5 px-3 rounded-md text-xs sm:text-sm mb-2 text-center">
          Timesheet has been approved & locked
        </p>
      )}
      <div className="grid grid-cols-2 sm:flex gap-2 sm:justify-end">
        {!disabled && (
          <>
            <FormActionButton
              onClick={handleSave}
              icon={faFloppyDisk}
              disabled={disabled}
              text={isSaving ? "Saving..." : "Save"}
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
        <Link to={href} className={secondaryBtnStyles}>
          + New
        </Link>
        <button onClick={handleCopy} className={secondaryBtnStyles}>
          + Copy
        </button>
      </div>
    </div>
  );
}
