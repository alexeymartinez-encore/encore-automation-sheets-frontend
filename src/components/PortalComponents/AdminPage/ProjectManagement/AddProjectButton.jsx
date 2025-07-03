import { useState } from "react";
import AddProjectModal from "./AddProjectModal";

export default function AddProjectButton() {
  const [showModal, setShowModal] = useState(false);

  function toggleModal() {
    setShowModal((prev) => !prev);
  }

  return (
    <div>
      <button
        onClick={toggleModal}
        className="bg-blue-500 text-white py-1 px-3 rounded-sm hover:bg-blue-400 font-light transition duration-400"
      >
        Add Project
      </button>
      {showModal && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={toggleModal}
        >
          <AddProjectModal toggleModal={toggleModal} />
        </div>
      )}
    </div>
  );
}
