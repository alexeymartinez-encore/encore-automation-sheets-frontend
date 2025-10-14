import React, { useContext } from "react";
import { faTrashCan, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MiscellaneousContext } from "../../../../../store/miscellaneous-context";
import {
  phaseToAllowedCostCodes,
  projectsToAllowedMixPhasesCostCodes,
} from "../../../../../util/helper-vars";
import EditEntryButton from "./EditEntryButton";
phaseToAllowedCostCodes;
export default function RowComponentMobile({
  row,
  index,
  onValueChange,
  onDeleteRow,
  disabled,
}) {
  const miscCtx = useContext(MiscellaneousContext);
  const restrictedProjects = ["Bereavement", "Holiday", "Vacation", "Sick"];

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
      const formElements = Array.from(
        e.target
          .closest("tr")
          .querySelectorAll("input, select, textarea, button")
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

  return (
    <tr className="bg-white text-[0.6rem] md:text-xs w-full ">
      <td className="border px-2 text-center">
        <EditEntryButton
          entry={row}
          index={index}
          onValueChange={onValueChange}
          onDeleteRow={onDeleteRow}
          disabled={disabled}
        />
      </td>

      {/* Project Selector */}
      <td className="border px-2 w-1/5 py-2">
        <select
          value={row.project_id ?? ""}
          className="w-full text-start px-0 appearance-none"
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
            <option className="text-4xl" key={project.id} value={project.id}>
              {/* {project.is_active} */}
              {project.number} - {project.description}
            </option>
          ))}
        </select>
      </td>

      {/* Phase Selector */}
      <td className="border px-2 w-1/5 py-2">
        <select
          value={row.phase_id ?? ""}
          className="w-full text-start px-0 appearance-none"
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
      </td>

      {/* Cost Code Selector */}
      <td className="border px-2 w-1/5 py-2">
        <select
          value={row.cost_code_id ?? ""}
          className="w-full text-start px-0 appearance-none"
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
      </td>

      {/* Total Hours */}
      <td className="border px-0 w-1/6 py-2">
        <input
          type="number"
          value={row.total_hours}
          className="w-full text-center px-2"
          placeholder="Total"
          readOnly
          disabled={disabled}
        />
      </td>

      {/* Delete Button */}
      <td className="border-r border-t border-b flex justify-between items-center px-2 text-center w-full">
        {!disabled && (
          <div className="flex justify-around items-center w-full py-2">
            <button onClick={() => onDeleteRow(index, row)}>
              <FontAwesomeIcon
                icon={faTrashCan}
                className="text-red-600 size-4"
              />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// const projects = ["Admin", "Bereavement", "Holiday", "Vacation"];
