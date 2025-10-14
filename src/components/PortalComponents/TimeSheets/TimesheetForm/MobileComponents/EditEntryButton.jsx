import { useState } from "react";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EditRowModal from "./EditRowModal";

export default function EditEntryButton({
  entry,
  index,
  onValueChange,
  onDeleteRow,
  disabled,
}) {
  const [showModal, setShowModal] = useState(false);

  function toggleModal() {
    setShowModal((prev) => !prev);
  }

  return (
    <div>
      <button onClick={toggleModal}>
        <FontAwesomeIcon icon={faEdit} className="text-blue-600 size-4" />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={toggleModal}
        >
          <EditRowModal
            toggleModal={toggleModal}
            row={entry}
            index={index}
            onValueChange={onValueChange}
            onDeleteRow={onDeleteRow}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
