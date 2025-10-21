import React, { useContext } from "react";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MiscellaneousContext } from "../../../../store/miscellaneous-context";
import {
  phaseToAllowedCostCodes,
  projectsToAllowedMixPhasesCostCodes,
} from "../../../../util/helper-vars";

export default function RowComponent({
  row,
  index,
  onValueChange,
  onDeleteRow,
  disabled,
}) {
  const allow_overtime = localStorage.getItem("allow_overtime") === "true";
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
    <tr className="bg-white text-[0.5rem] md:text-xs w-full">
      <td className="border px-2 text-center">{index + 1}</td>

      {/* Project Selector */}
      <td className="border px-2">
        <select
          value={row.project_id ?? ""}
          className="w-full text-start px-2"
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
      </td>

      {/* Phase Selector */}
      <td className="border px-2">
        <select
          value={row.phase_id ?? ""}
          className="w-full text-start px-2"
          onChange={(e) => {
            const newPhaseId = Number(e.target.value);
            onValueChange(index, "phase_id", newPhaseId);

            // Enforce a valid cost code when the phase changes (non-special projects)
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
      <td className="border px-2">
        <select
          value={row.cost_code_id ?? ""}
          className="w-full text-start px-2"
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

      {/* Description */}
      <td className="border px-2 text-center">
        <input
          type="text"
          value={row.description}
          className="w-full text-center px-2"
          placeholder="Description"
          onChange={(e) => onValueChange(index, "description", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        />
      </td>

      {/* Daily Fields */}
      {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
        <td key={day} className="border px-2">
          <input
            type="number"
            value={row[`${day}_reg`]}
            className="w-full text-center px-2"
            placeholder="Reg"
            min="0"
            step={0.5}
            max={isRestrictedProject ? 8 : undefined}
            onChange={(e) => {
              let value = Number(e.target.value);
              if (isNaN(value)) return;

              // Enforce per-day cap (for restricted projects)
              if (isRestrictedProject && value > 8) {
                value = 8;
              }
              if (value < 0) value = 0;

              // --- Weekly total restriction ---
              if (!allow_overtime) {
                // Calculate the total excluding this day's current value
                const currentTotal =
                  Number(row.mon_reg || 0) +
                  Number(row.tue_reg || 0) +
                  Number(row.wed_reg || 0) +
                  Number(row.thu_reg || 0) +
                  Number(row.fri_reg || 0) +
                  Number(row.sat_reg || 0) +
                  Number(row.sun_reg || 0);

                const previousDayValue = Number(row[`${day}_reg`] || 0);
                const newTotal = currentTotal - previousDayValue + value;

                if (newTotal > 40) {
                  // Cap the total so weekly total doesn’t exceed 40
                  const maxAllowedForThisInput =
                    40 - (currentTotal - previousDayValue);
                  value = Math.max(0, maxAllowedForThisInput);
                }
              }

              onValueChange(index, `${day}_reg`, value);
            }}
            onKeyDown={handleEnterKeyFocus}
            disabled={disabled}
          />
        </td>
      ))}

      {/* Total Hours */}
      <td className="border px-2">
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
      <td className="px-2 text-center">
        {!disabled && (
          <button onClick={() => onDeleteRow(index, row)}>
            <FontAwesomeIcon icon={faTrashCan} className="text-red-600" />
          </button>
        )}
      </td>
    </tr>
  );
}

// const projects = ["Admin", "Bereavement", "Holiday", "Vacation"];
