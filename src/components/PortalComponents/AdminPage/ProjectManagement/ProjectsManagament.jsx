import { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../../../store/admin-context";
import ButtonsContainerCard from "../../Shared/ButtonsContainerCard";
import TableActionButton from "../../Shared/TableActionButton";
import { MdDeleteForever } from "react-icons/md";
import { GoDash } from "react-icons/go";
import AddProjectButton from "./AddProjectButton";
import EditProjectButton from "./EditProjectButton";

export default function ProjectsManagement() {
  const [projects, setProjects] = useState([]);

  const adminCtx = useContext(AdminContext);
  useEffect(() => {
    const fetchProjects = async () => {
      const fetchedProjects = await adminCtx.getAllProjects();
      setProjects(fetchedProjects || []);
    };

    fetchProjects();
  }, [adminCtx]);
  console.log(projects);

  async function handleDelete(id) {
    // console.log(id);
    adminCtx.deleteProjectById(id);
  }

  return (
    <div className="bg-white rounded-md shadow-sm my-5 w-full overflow-x-scroll">
      <div className="flex justify-between p-5 w-full">
        {" "}
        <h1 className="text-xl">Projects List</h1>
        <AddProjectButton />
      </div>

      <table className="bg-white  w-full">
        <thead>
          <tr className="flex justify-around items-center border-b py-2 px-10 my-2  rounded-sm text-sm font-semibold text-center">
            {/* <p className="w-full">{project.id}</p> */}
            <th className="w-full px-10 md:px-0">Project Number</th>
            <th className="w-full px-10 md:px-0">Description</th>
            <th className="w-full px-10 md:px-0">Short Name</th>
            <th className="w-full px-10 md:px-0">Overtime</th>
            <th className="w-full px-10 md:px-0">SGA Flag</th>
            <th className="w-full px-10 md:px-0">Customer</th>
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
          {projects.map((project) => (
            <tr
              className="flex justify-around items-center py-2 px-10 my-2 border-b rounded-sm text-xs text-center"
              key={project.id}
            >
              {/* <p className="w-full px-10 md:px-0">{project.id}</p> */}
              <td className="w-full px-10 md:px-0">{project.number}</td>
              <td className="w-full px-10 md:px-0">
                {project.description === "" ? "-" : project.description}
              </td>
              <td className="w-full px-10 md:px-0">{project.short_name}</td>
              <td
                className={`w-full px-10 md:px-0 ${
                  project.overtime ? "text-green-500" : "text-red-600"
                }`}
              >
                {project.overtime ? "Yes" : "No"}
              </td>
              <td
                className={`w-full px-10 md:px-0 ${
                  project.sga_flag ? "text-green-500" : "text-red-600"
                }`}
              >
                {project.sga_flag ? "Yes" : "No"}
              </td>
              <td className="w-full px-10 md:px-0">{project.customer_name}</td>
              {/* <p className="w-full">{project.cell_phone}</p>
            <p className="w-full">{project.position}</p> */}
              <td>
                <ButtonsContainerCard>
                  <EditProjectButton project={project} />

                  <TableActionButton
                    onClick={() => handleDelete(project.id)}
                    color={"red"}
                  >
                    <MdDeleteForever className="text-red-500 size-3 md:size-5 hover:text-red-600 duration-300" />
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
