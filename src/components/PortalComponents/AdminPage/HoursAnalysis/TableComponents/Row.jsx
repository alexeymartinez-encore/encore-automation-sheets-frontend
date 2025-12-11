export default function Row({ employee, projectColumns, onHourChange }) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-3 py-2 font-medium">{employee.employee_name}</td>

      {projectColumns.map((project) => {
        // find the matching project entry
        const entry = employee.project_hours?.find(
          (p) => p.project_name === project
        );

        return (
          <td key={project} className="px-3 py-2 text-center">
            <input
              type="number"
              min="0"
              step="0.5"
              className="w-16 text-center border border-gray-300 rounded p-1"
              value={entry?.hours ?? ""}
              onChange={(e) =>
                onHourChange(
                  employee.employee_id,
                  project,
                  e.target.value,
                  entry?.entry_id || null,
                  entry?.project_id || null
                )
              }
            />
          </td>
        );
      })}
    </tr>
  );
}
