import { useContext, useState } from "react";
import { MiscellaneousContext } from "../../../../store/miscellaneous-context";
import { AdminContext } from "../../../../store/admin-context";

export default function AddProjectModal({ toggleModal }) {
  const [project, setProject] = useState({
    number: "",
    description: "",
    start_date: new Date(),
    end_date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    short_name: "",
    comment: "",
    overtime: "",
    sga_flag: "",
    customer_id: 0,
    customer_name: "",
    customer_contact: "",
  });

  const miscCtx = useContext(MiscellaneousContext);
  const adminCtx = useContext(AdminContext);

  function handleValueChange(field, value) {
    setProject((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  //   console.log(miscCtx.customers);
  console.log(project);
  function handleSave() {
    if (project.customer_id === 0) {
      project.customer_id = null;
    }
    adminCtx.createNewProject(project);
    toggleModal(); // Close the modal after saving
  }

  return (
    <div
      className="bg-white py-5 px-20 rounded-md text-center shadow-md w-[30rem] relative"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-center text-blue-500">
          Add New Project
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Project Number"
          value={project.number}
          onChange={(e) => handleValueChange("number", e.target.value)}
          className="border p-2 rounded-md text-center"
        />
        <input
          type="text"
          placeholder="Description"
          value={project.description}
          onChange={(e) => handleValueChange("description", e.target.value)}
          className="border p-2 rounded-md text-center"
        />{" "}
        <input
          type="text"
          placeholder="Abreviation"
          value={project.short_name}
          onChange={(e) => handleValueChange("short_name", e.target.value)}
          className="border p-2 rounded-md text-center"
        />{" "}
        <input
          type="text"
          placeholder="Comment"
          value={project.comment}
          onChange={(e) => handleValueChange("comment", e.target.value)}
          className="border p-2 rounded-md text-center"
        />{" "}
        <div>
          <p className="text-blue-500">Select Overtime:</p>
          <select
            value={
              project.overtime === true
                ? "true"
                : project.overtime === false
                ? "false"
                : ""
            }
            className="w-full text-center rounded-md  p-2 border "
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
        <div>
          <p className="text-blue-500">Select SGA Flag:</p>
          <select
            value={
              project.sga_flag === true
                ? "true"
                : project.sga_flag === false
                ? "false"
                : ""
            }
            className="w-full text-center rounded-md p-2 border"
            onChange={(e) =>
              handleValueChange("sga_flag", e.target.value === "true")
            }
          >
            <option value="">Select SGA Flag</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <p className="text-blue-500">Select Customer:</p>
          <select
            value={project.customer_id || ""}
            className="w-full text-center rounded-md  p-2 border"
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
          <p className="py-5">or enter new customer</p>
          <div className="flex flex-col gap-3">
            <input
              placeholder="Customer Name"
              className="w-full border p-2 rounded-md text-center"
              type="text"
              value={project.customer_name}
              onChange={(e) =>
                handleValueChange("customer_name", e.target.value)
              }
            />
            <input
              placeholder="Customer Phone"
              className="w-full border p-2 rounded-md text-center"
              type="text"
              value={project.customer_contact}
              onChange={(e) =>
                handleValueChange("customer_contact", e.target.value)
              }
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white py-2 px-3 rounded-sm hover:bg-blue-400 transition duration-400"
        >
          Save Project
        </button>
      </div>
    </div>
  );
}

// {
//     number: "24-3013",
//     description: "Stellantis Butterfly Valves",
//     start_date: new Date(),
//     end_date: new Date(),
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     short_name: "StllBV",
//     comment: "",
//     overtime: 1,
//     sga_flag: 1,
//     customer_id: 1003,
//   },
