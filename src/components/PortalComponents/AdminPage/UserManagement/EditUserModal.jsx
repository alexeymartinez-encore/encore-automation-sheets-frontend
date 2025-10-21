import { useContext, useEffect, useState } from "react";
import { MiscellaneousContext } from "../../../../store/miscellaneous-context";
import { AdminContext } from "../../../../store/admin-context";
import { UserContext } from "../../../../store/user-context";

export default function EditUserModal({ toggleModal, selectedUser }) {
  const [user, setUser] = useState(selectedUser);
  const [employees, setEmployees] = useState([]);

  const miscCtx = useContext(MiscellaneousContext);
  const adminCtx = useContext(AdminContext);
  const userCtx = useContext(UserContext);

  useEffect(() => {
    async function fetchAllEmployees() {
      const users = await userCtx.getAllEmployees();
      setEmployees(users);
    }
    fetchAllEmployees();
  }, []);

  function handleValueChange(field, value) {
    setUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleEdit(id) {
    adminCtx.editUserById(id, user);
    toggleModal(); // Close the modal after saving
  }

  return (
    <div
      className="bg-white py-5 px-10 rounded-md text-center shadow-md w-full md:w-[30rem] relative mx-5 md:mx-0 "
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">First Name</label>
          <input
            type="text"
            placeholder="First Name"
            value={user.first_name}
            onChange={(e) => handleValueChange("first_name", e.target.value)}
            className="border p-2 rounded-md text-center w-2/3"
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Last Name</label>
          <input
            type="text"
            placeholder="Last Name"
            value={user.last_name}
            onChange={(e) => handleValueChange("last_name", e.target.value)}
            className="border p-2 rounded-md text-center w-2/3"
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={user.email}
            onChange={(e) => handleValueChange("email", e.target.value)}
            className="border p-2 rounded-md text-center w-2/3"
          />{" "}
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Cell Phone</label>
          <input
            type="text"
            placeholder="Cell Phone"
            value={user.cell_phone}
            onChange={(e) => handleValueChange("cell_phone", e.target.value)}
            className="border p-2 rounded-md text-center w-2/3"
          />{" "}
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Home Phone</label>
          <input
            type="text"
            placeholder="Home Phone"
            value={user.home_phone}
            onChange={(e) => handleValueChange("home_phone", e.target.value)}
            className="border p-2 rounded-md text-center w-2/3"
          />{" "}
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Position</label>
          <input
            type="text"
            placeholder="Position"
            value={user.position}
            onChange={(e) => handleValueChange("position", e.target.value)}
            className="border p-2 rounded-md text-center w-2/3"
          />{" "}
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Employee #</label>
          <input
            type="text"
            placeholder="Employee #"
            value={user.employee_number}
            onChange={(e) =>
              handleValueChange("employee_number", e.target.value)
            }
            className="border p-2 rounded-md text-center w-2/3"
          />{" "}
        </div>

        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">
            Is Contractor?
          </label>
          <select
            value={user.is_contractor}
            className="w-2/3 text-center py-2 border rounded-md"
            onChange={(e) => handleValueChange("is_contractor", e.target.value)}
          >
            <option value="Nothing"></option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Is Active?</label>
          <select
            value={user.is_active}
            className="w-2/3 text-center py-2 border rounded-md"
            onChange={(e) => handleValueChange("is_active", e.target.value)}
          >
            <option value="Nothing"></option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">
            Allow Overtime
          </label>
          <select
            value={user.allow_overtime}
            className="w-2/3 text-center py-2 border rounded-md"
            onChange={(e) =>
              handleValueChange("allow_overtime", e.target.value)
            }
          >
            <option value="Nothing"></option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Admin Level</label>

          <select
            value={user.role_id}
            className="w-2/3 text-center py-2 border rounded-md "
            onChange={(e) => handleValueChange("role_id", e.target.value)}
          >
            <option className="text-gray-100" value="Nothing"></option>
            <option value={1}>Employee</option>
            <option value={2}>Manager</option>
            <option value={3}>Admin</option>
          </select>
        </div>
        <div className="flex justify-between items-center">
          <label className="text-blue-500 w-1/3 text-left">Reports to:</label>
          <select
            value={user.manager_id}
            className="w-2/3 text-center py-2 border rounded-md"
            onChange={(e) => handleValueChange("manager_id", e.target.value)}
          >
            <option value="Nothing">Nothing</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.first_name} {employee.last_name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => handleEdit(user.id)}
          className="bg-blue-500 text-white py-2 px-3 rounded-sm hover:bg-blue-400 transition duration-400"
        >
          Edit User
        </button>
      </div>
    </div>
  );
}
