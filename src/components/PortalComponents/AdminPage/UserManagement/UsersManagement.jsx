import { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../../../store/admin-context";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import ButtonsContainerCard from "../../Shared/ButtonsContainerCard";
import TableActionButton from "../../Shared/TableActionButton";
import { GoDash } from "react-icons/go";

export default function UsersManagement() {
  const [employees, setEmployees] = useState([]);
  const adminCtx = useContext(AdminContext);
  useEffect(() => {
    const fetchEmployees = async () => {
      const fetchedEmployees = await adminCtx.getAllEmployees();
      setEmployees(fetchedEmployees || []);
    };

    fetchEmployees();
  }, [adminCtx]);
  return (
    <div className="bg-white rounded-md shadow-sm my-5 w-full overflow-x-scroll">
      <div className="flex justify-between p-5 ">
        <h1 className="text-sm md:text-xl">Employee List</h1>
      </div>
      <table className="w-full">
        <thead>
          <tr className="flex justify-around  py-0 px-1 my-0 border-b rounded-sm text-[0.6rem] md:text-sm">
            {/* <p className="w-full">{project.id}</p> */}
            <th className="w-full px-1 md:px-0">#</th>
            <th className="w-full px-10 md:px-0">User</th>
            <th className="w-full px-10 md:px-0">Name</th>
            {/* <th className="w-full px-10 md:px-0">Last</th> */}
            <th className="w-full px-10 md:px-0">Email</th>
            <th className="w-full px-10 md:px-0">Home #</th>
            <th className="w-full px-10 md:px-0">Cell #</th>
            <th className="w-full px-10 md:px-0">Position</th>
            <th>
              <ButtonsContainerCard>
                <TableActionButton
                  // onClick={handleEdit}
                  color={"blue"}
                >
                  <GoDash className="text-blue-500 size-3 md:size-5" />
                </TableActionButton>

                <TableActionButton
                  // onClick={() => handleDelete(timesheet.id)}
                  color={"red"}
                >
                  <GoDash className="text-red-500 size-3 md:size-5" />
                </TableActionButton>
              </ButtonsContainerCard>
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr
              className="flex items-center justify-around  py-1 px-1 my-0 border-b rounded-sm text-[0.6rem]  md:text-xs text-center"
              key={employee.id}
            >
              {/* <p className="w-full">{employee.id}</p> */}
              <td className="w-full  px-1 md:px-0">
                {employee.employee_number}
              </td>
              <td className="w-full px-10 md:px-0">{employee.user_name}</td>
              <td className="w-full px-10 md:px-0">
                {employee.first_name} {employee.last_name}
              </td>
              {/* <td className="w-full px-10 md:px-0">{employee.last_name}</td> */}
              <td className="w-full px-0 md:px-0 ">{employee.email}</td>
              <td className="w-full px-10 md:px-0">{employee.home_phone}</td>
              <td className="w-full px-10 md:px-0">{employee.cell_phone}</td>
              <td className="w-full px-10 md:px-0">{employee.position}</td>
              <td>
                <ButtonsContainerCard>
                  <TableActionButton
                    // onClick={handleEdit}
                    color={"blue"}
                  >
                    <FaEdit className="text-blue-500 size-3 md:size-5" />
                  </TableActionButton>

                  <TableActionButton
                    // onClick={() => handleDelete(timesheet.id)}
                    color={"red"}
                  >
                    <MdDeleteForever className="text-red-500 size-3 md:size-5" />
                  </TableActionButton>
                </ButtonsContainerCard>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
