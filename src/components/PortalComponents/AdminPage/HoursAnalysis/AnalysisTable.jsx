import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { useEffect, useState, useContext } from "react";
import { AdminContext } from "../../../../store/admin-context";
import DatePickerComponent from "../../Shared/DatePickerComponent";
import { getEndOfWeek } from "../../../../util/helper";

function DraggableCell({ entry }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `entry_${entry.entry_id}`,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
        position: "relative",
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="cursor-move text-center bg-white p-1 rounded border border-gray-300 shadow-sm"
    >
      {entry.hours ?? 0}
    </div>
  );
}

function DroppableCell({ employeeId, projectId, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `cell_${employeeId}_${projectId}`,
  });

  return (
    <td
      ref={setNodeRef}
      className={`border border-gray-300 text-center p-1 transition-all ${
        isOver ? "bg-blue-100" : ""
      }`}
    >
      {children}
    </td>
  );
}

export default function AnalysisTable() {
  const [projects, setProjects] = useState([]);
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getEndOfWeek(new Date()));
  const [changes, setChanges] = useState([]);
  const adminCtx = useContext(AdminContext);

  useEffect(() => {
    async function fetchData() {
      const formatted = selectedDate.toISOString().split("T")[0];
      const result = await adminCtx.getEmployeeProjectAllocation(formatted);
      setProjects(result.projects || []);
      setData(result.data || []);
    }
    fetchData();
  }, [selectedDate]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const entryId = Number(active.id.replace("entry_", ""));
    const [_, employeeId, projectId] = over.id.split("_"); // e.g. cell_1_9

    const newProjectId = Number(projectId);

    setChanges((prev) => {
      const existing = prev.find((c) => c.entry_id === entryId);
      if (existing) {
        return prev.map((c) =>
          c.entry_id === entryId ? { ...c, new_project_id: newProjectId } : c
        );
      }
      return [...prev, { entry_id: entryId, new_project_id: newProjectId }];
    });
  };

  const handleSave = async () => {
    if (changes.length === 0) {
      alert("No changes detected.");
      return;
    }

    console.log("Changes to send:", changes);
    // await adminCtx.saveEmployeeProjectAllocation(changes);
    // await fetchData();
    alert(`${changes.length} project change(s) saved!`);
    setChanges([]);
  };

  return (
    <div className="pt-5">
      <div className="flex justify-end gap-3 my-3">
        <DatePickerComponent
          selected={selectedDate}
          onChange={setSelectedDate}
        />
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          Save
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <table className="w-full border-collapse border border-gray-300 text-sm my-10 bg-white">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-200">Employee</th>
              {projects.map((p) => (
                <th
                  key={p.id}
                  className="border border-gray-300 bg-gray-100 text-center py-2"
                >
                  {p.number}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((emp) => (
              <tr key={emp.employee_id}>
                <td className="border border-gray-300 px-2 py-1 font-semibold bg-gray-50">
                  {emp.employee_name}
                </td>
                {projects.map((p) => {
                  const entry = Object.values(emp.project_hours || {}).find(
                    (e) => e.project_id === p.id
                  );
                  return (
                    <DroppableCell
                      key={`${emp.employee_id}-${p.id}`}
                      employeeId={emp.employee_id}
                      projectId={p.id}
                    >
                      {entry ? <DraggableCell entry={entry} /> : "-"}
                    </DroppableCell>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}
