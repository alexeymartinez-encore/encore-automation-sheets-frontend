import { useState } from "react";
import EditProjectModal from "./EditProjectModal";
import TableActionButton from "../../Shared/TableActionButton";
import { FaEdit } from "react-icons/fa";

export default function EditProjectButton({ project }) {
  const [showModal, setShowModal] = useState(false);

  function toggleModal() {
    setShowModal((prev) => !prev);
  }

  console.log(project);

  return (
    <div>
      <TableActionButton onClick={toggleModal} color={"blue"}>
        <FaEdit className="text-blue-500 size-3 md:size-5 hover:text-blue-600 duration-300" />
      </TableActionButton>

      {showModal && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={toggleModal}
        >
          <EditProjectModal
            toggleModal={toggleModal}
            selectedProject={project}
          />
        </div>
      )}
    </div>
  );
}
