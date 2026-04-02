import { useState } from "react";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EditRowModal from "./EditRowModal";

export default function EditEntryButton({
  entry,
  index,
  onValueChange,
  disabled,
}) {
  const [showModal, setShowModal] = useState(false);

  function toggleModal() {
    setShowModal((prev) => !prev);
  }

  return (
    <div>
      <button type="button" onClick={toggleModal}>
        <FontAwesomeIcon icon={faEdit} className="text-blue-600 size-3.5" />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/55 flex justify-center items-start sm:items-center p-3 sm:p-4 overflow-y-auto"
          onClick={toggleModal}
        >
          <EditRowModal
            toggleModal={toggleModal}
            row={entry}
            index={index}
            onValueChange={onValueChange}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
