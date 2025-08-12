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
  const miscCtx = useContext(MiscellaneousContext);
  console.log(miscCtx.projects);
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

  const selectedProject = miscCtx.projects.find((p) => p.id == row.project_id);
  const specialProject = selectedProject
    ? projectsToAllowedMixPhasesCostCodes[selectedProject.number]
    : null;

  return (
    <tr className="bg-white text-[0.5rem] md:text-xs w-full">
      <td className="border px-2 text-center">{index + 1}</td>

      {/* Project Selector */}
      <td className="border px-2">
        <select
          value={row.project_id}
          className="w-full text-center px-2"
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
                onValueChange(index, "phase_id", Number(matchingPhase.id));
              if (matchingCostCode)
                onValueChange(
                  index,
                  "cost_code_id",
                  Number(matchingCostCode.id)
                );
            }
          }}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        >
          {[...miscCtx.projects]
            .sort((a, b) => {
              const startsWithDigitA = /^\d/.test(a.number);
              const startsWithDigitB = /^\d/.test(b.number);

              if (startsWithDigitA && !startsWithDigitB) return 1; // A goes after B
              if (!startsWithDigitA && startsWithDigitB) return -1; // A goes before B

              return a.number.localeCompare(b.number, undefined, {
                sensitivity: "base",
              });
            })
            .map((project) => (
              <option key={project.id} value={project.id}>
                {project.number} - {project.description}
              </option>
            ))}
        </select>
      </td>

      {/* Phase Selector */}
      <td className="border px-2">
        <select
          value={row.phase_id}
          className="w-full text-center px-2"
          onChange={(e) => {
            const newPhaseId = Number(e.target.value);
            onValueChange(index, "phase_id", newPhaseId);

            // Re-align cost_code_id to a valid ID for this phase
            const phaseNumber = miscCtx.phases.find(
              (p) => p.id == newPhaseId
            )?.number;
            const allowedCodes = phaseToAllowedCostCodes[phaseNumber] || [];

            // Current cost code number from cost_code_id
            const currentCC = miscCtx.costCodes.find(
              (c) => c.id == row.cost_code_id
            );
            const currentCode = currentCC?.cost_code;

            if (!currentCode || !allowedCodes.includes(currentCode)) {
              // Pick the first allowed cost_code number and map to its ID
              const targetCode = allowedCodes[0];
              const match = miscCtx.costCodes.find(
                (c) => c.cost_code == targetCode
              );
              if (match) onValueChange(index, "cost_code_id", Number(match.id));
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
          value={row.cost_code_id}
          className="w-full text-center px-2"
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

            const phaseNumber = miscCtx.phases.find(
              (p) => p.id == row.phase_id
            )?.number;
            const allowedCodes = phaseToAllowedCostCodes[phaseNumber] || [];

            return miscCtx.costCodes
              .filter((costCode) => allowedCodes.includes(costCode.cost_code))
              .map((costCode) => (
                <option key={costCode.id} value={costCode.id}>
                  {costCode.cost_code} - {costCode.description}
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
            value={row[`${day}_reg`]}
            className="w-full text-center px-2"
            placeholder="Reg"
            onChange={(e) => onValueChange(index, `${day}_reg`, e.target.value)}
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
          <button>
            <FontAwesomeIcon
              icon={faTrashCan}
              className="text-red-600"
              onClick={() => onDeleteRow(index, row)}
            />
          </button>
        )}
      </td>
    </tr>
  );
}
