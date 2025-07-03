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
}) {
  const miscCtx = useContext(MiscellaneousContext);

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
      if (nextElement) {
        nextElement.focus();
      }
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
            const projectId = e.target.value;
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
        >
          {miscCtx.projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.number}
            </option>
          ))}
        </select>
      </td>

      {/* Phase Selector */}
      <td className="border px-2">
        <select
          value={row.phase_id}
          className="w-full text-center px-2"
          onChange={(e) => onValueChange(index, "phase_id", e.target.value)}
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
          onChange={(e) => onValueChange(index, "cost_code_id", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
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

            const allowedCodes =
              phaseToAllowedCostCodes[
                miscCtx.phases.find((p) => p.id == row.phase_id)?.number
              ] || [];

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
        />
      </td>

      {/* Delete Button */}
      <td className="px-2">
        <button>
          <FontAwesomeIcon
            icon={faTrashCan}
            className="text-red-600"
            onClick={() => onDeleteRow(index, row)}
          />
        </button>
      </td>
    </tr>
  );
}
