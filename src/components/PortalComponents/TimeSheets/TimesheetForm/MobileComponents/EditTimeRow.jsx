import { useState } from "react";
import AddProjectModal from "./EditRowModal";
import EditRowModal from "./EditRowModal";

export default function EditTimeRow({ onShowEditModal }) {
  const [showModal, setShowModal] = useState(false);

  function toggleModal() {
    setShowModal((prev) => !prev);
  }

  return (
    <div>
      <button onClick={() => onShowEditModal(index, row)}>
        <FontAwesomeIcon icon={faEdit} className="text-blue-600 size-4" />
      </button>
      {showModal && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={toggleModal}
        >
          <EditRowModal toggleModal={toggleModal} />
        </div>
      )}
    </div>
  );
}
