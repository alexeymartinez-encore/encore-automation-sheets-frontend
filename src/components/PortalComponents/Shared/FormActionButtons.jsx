import FormActionButton from "./FormActionButton";
import { faFloppyDisk, faSignature } from "@fortawesome/free-solid-svg-icons";

export default function FormActionsButtons({
  handleSave,
  handleSign,
  signed,
  saved,
}) {
  return (
    <div className="flex gap-1 justify-between ">
      <FormActionButton
        onClick={handleSave}
        icon={faFloppyDisk}
        // signed={saved}
      />
      <FormActionButton
        onClick={handleSign}
        icon={faSignature}
        signed={signed}
      />
    </div>
  );
}
