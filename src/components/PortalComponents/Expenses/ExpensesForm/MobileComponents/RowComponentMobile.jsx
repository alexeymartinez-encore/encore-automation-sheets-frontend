import { useContext } from "react";
import { MiscellaneousContext } from "../../../../../store/miscellaneous-context";
import EditEntryButton from "./EditEntryButton";

function getRowTotal(row) {
  return (
    Number(row.destination_cost || 0) +
    Number(row.lodging_cost || 0) +
    Number(row.other_expense_cost || 0) +
    Number(row.car_rental_cost || 0) +
    Number(row.miles_cost || 0) +
    Number(row.perdiem_cost || 0) +
    Number(row.entertainment_cost || 0) +
    Number(row.miscellaneous_amount || 0)
  );
}

export default function RowComponentMobile({
  row,
  index,
  onValueChange,
  onAddSubRow,
  onDeleteRow,
  disabled,
}) {
  const miscCtx = useContext(MiscellaneousContext);
  const isProjectActive = (project) =>
    project?.is_active !== false && project?.active !== false;

  const sortedProjects = [...(miscCtx.projects || [])].sort((a, b) => {
    const aStartsLetter = /^[A-Za-z]/.test(a.number.trim());
    const bStartsLetter = /^[A-Za-z]/.test(b.number.trim());
    if (aStartsLetter && !bStartsLetter) return -1;
    if (!aStartsLetter && bStartsLetter) return 1;
    return a.number.localeCompare(b.number, undefined, {
      sensitivity: "base",
    });
  });

  const activeProjects = sortedProjects.filter(isProjectActive);
  const selectedInactiveProject = sortedProjects.find(
    (project) =>
      String(project.id) === String(row.project_id) && !isProjectActive(project)
  );

  const totalAmount = getRowTotal(row);

  return (
    <tr className="bg-white text-[0.68rem]">
      <td className="border px-1 text-center">
        <EditEntryButton
          entry={row}
          index={index}
          onValueChange={onValueChange}
          disabled={disabled}
        />
      </td>
      <td className="border px-1 text-center">
        <button
          type="button"
          className={`${disabled ? "text-red-200/90" : "text-red-600"} text-sm`}
          onClick={() => onDeleteRow(index)}
          disabled={disabled}
        >
          -
        </button>
      </td>
      <td className="border px-1 text-center">
        <button
          type="button"
          className={`${disabled ? "text-indigo-200/90" : "text-indigo-600"} text-sm`}
          onClick={() => onAddSubRow(index)}
          disabled={disabled}
        >
          +
        </button>
      </td>
      <td className="border px-1 text-center font-medium">{row.day}</td>
      <td className="border px-1 py-1">
        <select
          value={row.project_id}
          className="w-full text-[0.68rem] text-start appearance-none"
          onChange={(e) => onValueChange(index, "project_id", e.target.value)}
          disabled={disabled}
        >
          <option value="Nothing"></option>
          <optgroup label="Active Projects">
            {activeProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.number} - {project.description}
              </option>
            ))}
          </optgroup>
          {selectedInactiveProject && (
            <optgroup label="Selected Inactive Project">
              <option value={selectedInactiveProject.id}>
                {selectedInactiveProject.number} -{" "}
                {selectedInactiveProject.description} (inactive)
              </option>
            </optgroup>
          )}
        </select>
      </td>
      <td className="border px-1 text-center font-medium">
        ${totalAmount.toFixed(2)}
      </td>
    </tr>
  );
}
