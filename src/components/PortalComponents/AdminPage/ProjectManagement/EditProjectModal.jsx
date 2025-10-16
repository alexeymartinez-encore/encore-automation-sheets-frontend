import { useContext, useState } from "react";
import { MiscellaneousContext } from "../../../../store/miscellaneous-context";
import { AdminContext } from "../../../../store/admin-context";

export default function EditProjectFormM({ toggleModal, selectedProject }) {
  const [project, setProject] = useState(selectedProject);

  const miscCtx = useContext(MiscellaneousContext);
  const adminCtx = useContext(AdminContext);

  function handleValueChange(field, value) {
    setProject((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleEdit(id) {
    if (project.customer_id === 0) {
      project.customer_id = null;
    }
    adminCtx.editProjectById(id, project);
    toggleModal(); // Close the modal after saving
  }

  return (
    <div
      className="bg-white py-5 px-10 rounded-md text-center shadow-md w-full md:w-[30rem] relative mx-5 md:mx-0 "
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-center text-blue-500">
          Add New Project
        </h2>
        {/* <button
          onClick={toggleModal}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button> */}
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Project #</label>
          <input
            type="text"
            placeholder="Project Number"
            value={project.number}
            onChange={(e) => handleValueChange("number", e.target.value)}
            className="border p-2 rounded-md text-center w-2/3"
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Description</label>
          <input
            type="text"
            placeholder="Description"
            value={project.description}
            onChange={(e) => handleValueChange("description", e.target.value)}
            className="border p-2 rounded-md text-center w-2/3"
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Abbreviation</label>
          <input
            type="text"
            placeholder="Abreviation"
            value={project.short_name}
            onChange={(e) => handleValueChange("short_name", e.target.value)}
            className="border p-2 rounded-md text-center w-2/3"
          />{" "}
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Comment</label>
          <input
            type="text"
            placeholder="Comment"
            value={project.comment}
            onChange={(e) => handleValueChange("comment", e.target.value)}
            className="border p-2 rounded-md text-center w-2/3"
          />{" "}
        </div>

        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Overtime?</label>
          <select
            value={
              project.overtime === true
                ? "true"
                : project.overtime === false
                ? "false"
                : ""
            }
            className="w-2/3 text-center rounded-md  p-2 border "
            onChange={(e) =>
              handleValueChange("overtime", e.target.value === "true")
            }
            //   onKeyDown={handleEnterKeyFocus}
          >
            <option value="">Select Overtime</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">SGA?</label>
          <select
            value={
              project.sga_flag === true
                ? "true"
                : project.sga_flag === false
                ? "false"
                : ""
            }
            className="w-2/3 text-center rounded-md p-2 border"
            onChange={(e) =>
              handleValueChange("sga_flag", e.target.value === "true")
            }
          >
            <option value="">Select SGA Flag</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Active?</label>
          <select
            value={
              project.is_active === true
                ? "true"
                : project.is_active === false
                ? "false"
                : ""
            }
            className="w-2/3 text-center rounded-md p-2 border"
            onChange={(e) =>
              handleValueChange("is_active", e.target.value === "true")
            }
          >
            <option value="">Select Is Active</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Customer</label>
          <select
            value={project.customer_id || ""}
            className="w-2/3 text-center rounded-md  p-2 border"
            // onChange={() => {}}
            onChange={(e) =>
              handleValueChange("customer_id", parseInt(e.target.value))
            }
            //   onKeyDown={handleEnterKeyFocus}
          >
            <option value=""></option>
            {miscCtx.customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => handleEdit(project.id)}
          className="bg-blue-500 text-white py-2 px-3 rounded-sm hover:bg-blue-400 transition duration-400"
        >
          Edit Project
        </button>
      </div>
    </div>
  );
}
