import { useContext } from "react";
import { MiscellaneousContext } from "../../../../../store/miscellaneous-context";
import {
  phaseToAllowedCostCodes,
  projectsToAllowedMixPhasesCostCodes,
} from "../../../../../util/helper-vars";

export default function EditRowModal({
  toggleModal,
  row,
  index,
  onValueChange,
  disabled,
  dayLabels = {},
}) {
  const miscCtx = useContext(MiscellaneousContext);
  const restrictedProjects = [
    "Admin",
    "Bereavement",
    "Holiday",
    "Vacation",
    "Sick",
  ];

  // --- Project Sorting (unchanged) ---
  const sortedProjects = [...(miscCtx.projects || [])].sort((a, b) => {
    const aStartsLetter = /^[A-Za-z]/.test(a.number.trim());
    const bStartsLetter = /^[A-Za-z]/.test(b.number.trim());
    if (aStartsLetter && !bStartsLetter) return -1;
    if (!aStartsLetter && bStartsLetter) return 1;
    return a.number.localeCompare(b.number, undefined, { sensitivity: "base" });
  });

  // --- Enter key navigation (unchanged) ---
  function handleEnterKeyFocus(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const modalContainer = e.target.closest("[data-edit-row-modal]");
      if (!modalContainer) return;

      const formElements = Array.from(
        modalContainer.querySelectorAll("input, select, textarea, button")
      ).filter((el) => !el.disabled && el.tabIndex !== -1);

      const currentIndex = formElements.indexOf(e.target);
      const nextElement = formElements[currentIndex + 1];
      if (nextElement) nextElement.focus();
    }
  }

  // --- Helpers ---
  const selectedProject = miscCtx.projects.find((p) => p.id == row.project_id);
  const specialProject = selectedProject
    ? projectsToAllowedMixPhasesCostCodes[selectedProject.number]
    : null;

  const getPhaseNumberById = (phaseId) =>
    miscCtx.phases.find((p) => p.id == phaseId)?.number;

  const getAllowedCostCodeIdsForPhaseId = (phaseId) => {
    const phaseNum = getPhaseNumberById(phaseId);
    const allowedNums = phaseToAllowedCostCodes[phaseNum] || [];
    // translate cost_code numbers -> ids
    return miscCtx.costCodes
      .filter((c) => allowedNums.includes(c.cost_code))
      .map((c) => c.id);
  };

  const isRestrictedProject = selectedProject
    ? restrictedProjects.includes(selectedProject.number)
    : false;
  const rowClass = "grid grid-cols-[6.4rem_minmax(0,1fr)] items-center gap-2";
  const labelClass =
    "text-blue-500 font-semibold uppercase tracking-wide text-[0.7rem]";
  const controlClass =
    "h-9 border border-slate-300 rounded-sm w-full text-start px-2 text-[0.8rem]";

  return (
    <div
      data-edit-row-modal
      className="w-[min(92vw,26rem)] max-h-[88vh] overflow-y-auto bg-white text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4 rounded-xl shadow-xl flex flex-col gap-2"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-1">
        <p className="font-semibold text-blue-600">Edit Entry</p>
        <button
          type="button"
          onClick={toggleModal}
          className="text-[0.72rem] text-slate-500 hover:text-slate-700"
        >
          Close
        </button>
      </div>

      {/* Project Selector */}
      <div className={rowClass}>
        <label className={labelClass}>Project</label>

        <select
          value={row.project_id ?? ""}
          className={controlClass}
          onChange={(e) => {
            const projectId = Number(e.target.value);
            const selectedProject = miscCtx.projects.find(
              (p) => p.id == projectId
            );
            const special =
              projectsToAllowedMixPhasesCostCodes[selectedProject?.number];

            onValueChange(index, "project_id", projectId);

            if (special) {
              const [phaseNum, costCodeNum] = special;

              const matchingPhase = miscCtx.phases.find(
                (p) => p.number == phaseNum
              );
              const matchingCostCode = miscCtx.costCodes.find(
                (c) => c.cost_code == costCodeNum
              );

              if (matchingPhase)
                onValueChange(index, "phase_id", matchingPhase.id);
              if (matchingCostCode)
                onValueChange(index, "cost_code_id", matchingCostCode.id);
            }
          }}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        >
          {sortedProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {/* {project.is_active} */}
              {project.number} - {project.description}
            </option>
          ))}
        </select>
      </div>

      {/* Phase Selector */}
      <div className={rowClass}>
        <label className={labelClass}>Phase</label>
        <select
          value={row.phase_id ?? ""}
          className={controlClass}
          onChange={(e) => {
            const newPhaseId = Number(e.target.value);
            onValueChange(index, "phase_id", newPhaseId);

            // 🔥 Enforce a valid cost code when the phase changes (non-special projects)
            if (!specialProject) {
              const allowedIds = getAllowedCostCodeIdsForPhaseId(newPhaseId);
              if (
                allowedIds.length > 0 &&
                !allowedIds.includes(row.cost_code_id)
              ) {
                onValueChange(index, "cost_code_id", allowedIds[0]); // pick first allowed
              }
              // Optional: if none allowed, clear it
              if (allowedIds.length === 0) {
                onValueChange(index, "cost_code_id", "");
              }
            }
          }}
          onKeyDown={handleEnterKeyFocus}
          disabled={!!specialProject}
          >
            {miscCtx.phases.map((phase) => (
              <option key={phase.id} value={phase.id}>
              {phase.number} - {phase.description}
            </option>
            ))}
          </select>
      </div>

      {/* Cost Code Selector */}
      <div className={rowClass}>
        <label className={labelClass}>Cost Code</label>
        <select
          value={row.cost_code_id ?? ""}
          className={controlClass}
          onChange={(e) =>
            onValueChange(index, "cost_code_id", Number(e.target.value))
          }
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        >
          {(() => {
            if (specialProject) {
              const allowedCostCode = specialProject[1];
              return miscCtx.costCodes
                .filter((c) => c.cost_code == allowedCostCode)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cost_code} - {c.description}
                  </option>
                ));
            }

            const allowedIds = getAllowedCostCodeIdsForPhaseId(row.phase_id);
            const allowedSet = new Set(allowedIds);

            return miscCtx.costCodes
              .filter((c) => allowedSet.has(c.id))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.cost_code} - {c.description}
                </option>
              ));
          })()}
        </select>
      </div>

      {/* Description */}
      <div className={rowClass}>
        <label className={labelClass}>Description</label>
        <input
          type="text"
          value={row.description}
          className={`${controlClass} text-center`}
          placeholder="Description"
          onChange={(e) => onValueChange(index, "description", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        />
      </div>

      {/* Daily Fields */}
      {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
        <div key={day} className={rowClass}>
          <label className={labelClass}>
            {day.toUpperCase()} {dayLabels[day] ? `(${dayLabels[day]})` : ""}
          </label>
          <input
            type="number"
            value={row[`${day}_reg`]}
            className={`${controlClass} text-center`}
            placeholder={day}
            min="0"
            max={isRestrictedProject ? 8 : undefined}
            onChange={(e) => {
              let value = e.target.value;

              // Enforce numeric range
              if (isRestrictedProject && Number(value) > 8) {
                value = 8;
              }
              if (Number(value) < 0) {
                value = 0;
              }

              onValueChange(index, `${day}_reg`, value);
            }}
            onKeyDown={handleEnterKeyFocus}
            disabled={disabled}
          />
        </div>
      ))}

      {/* Total Hours */}
      <div className={rowClass}>
        <label className={labelClass}>Total</label>

        <input
          type="number"
          value={row.total_hours}
          className={`${controlClass} text-center`}
          placeholder="Total"
          readOnly
          disabled={disabled}
        />
      </div>

      <div className="sticky bottom-0 bg-white pt-2">
        <button
          type="button"
          onClick={toggleModal}
          className="w-full h-10 bg-blue-500 text-white rounded-md hover:bg-blue-400 transition duration-300"
        >
          Done
        </button>
      </div>
    </div>
  );
}
