import { useContext } from "react";
import { MiscellaneousContext } from "../../../../../store/miscellaneous-context";

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

export default function EditRowModal({
  toggleModal,
  row,
  index,
  onValueChange,
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

  const rowClass = "grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-2";
  const labelClass =
    "text-blue-500 font-semibold uppercase tracking-wide text-[0.7rem]";
  const controlClass =
    "h-9 border border-slate-300 rounded-sm w-full text-start px-2 text-[0.8rem]";

  function handleEnterKeyFocus(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const modalContainer = e.target.closest("[data-edit-expense-row-modal]");
      if (!modalContainer) return;

      const formElements = Array.from(
        modalContainer.querySelectorAll("input, select, textarea, button")
      ).filter((el) => !el.disabled && el.tabIndex !== -1);

      const currentIndex = formElements.indexOf(e.target);
      const nextElement = formElements[currentIndex + 1];
      if (nextElement) nextElement.focus();
    }
  }

  function handleAmountBlur(field, rawValue) {
    const value = Number.parseFloat(rawValue || 0);
    onValueChange(index, field, (Number.isNaN(value) ? 0 : value).toFixed(2));
  }

  const totalAmount = getRowTotal(row);

  return (
    <div
      data-edit-expense-row-modal
      className="w-[min(92vw,28rem)] max-h-[88vh] overflow-y-auto bg-white text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4 rounded-xl shadow-xl flex flex-col gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-1">
        <p className="font-semibold text-blue-600">Edit Entry - Day {row.day}</p>
        <button
          type="button"
          onClick={toggleModal}
          className="text-[0.72rem] text-slate-500 hover:text-slate-700"
        >
          Close
        </button>
      </div>

      <div className={rowClass}>
        <label className={labelClass}>Project</label>
        <select
          value={row.project_id}
          className={controlClass}
          onChange={(e) => onValueChange(index, "project_id", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
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
      </div>

      <div className={rowClass}>
        <label className={labelClass}>Purpose</label>
        <input
          type="text"
          value={row.purpose}
          className={controlClass}
          placeholder="Describe purpose"
          onChange={(e) => onValueChange(index, "purpose", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        />
      </div>

      <div className={rowClass}>
        <label className={labelClass}>Travel From/To</label>
        <input
          type="text"
          value={row.destination_name}
          className={controlClass}
          placeholder="Destination"
          onChange={(e) =>
            onValueChange(index, "destination_name", e.target.value)
          }
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        />
      </div>

      <div className={rowClass}>
        <label className={labelClass}>Travel Amount</label>
        <input
          type="number"
          value={row.destination_cost}
          className={controlClass}
          placeholder="0.00"
          onChange={(e) =>
            onValueChange(index, "destination_cost", e.target.value)
          }
          onBlur={(e) => handleAmountBlur("destination_cost", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        />
      </div>

      <div className={rowClass}>
        <label className={labelClass}>Lodging</label>
        <input
          type="number"
          value={row.lodging_cost}
          className={controlClass}
          placeholder="0.00"
          onChange={(e) => onValueChange(index, "lodging_cost", e.target.value)}
          onBlur={(e) => handleAmountBlur("lodging_cost", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        />
      </div>

      <div className={rowClass}>
        <label className={labelClass}>Parking/Tolls/Gas</label>
        <input
          type="number"
          value={row.other_expense_cost}
          className={controlClass}
          placeholder="0.00"
          onChange={(e) =>
            onValueChange(index, "other_expense_cost", e.target.value)
          }
          onBlur={(e) => handleAmountBlur("other_expense_cost", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        />
      </div>

      <div className={rowClass}>
        <label className={labelClass}>Car Rental</label>
        <input
          type="number"
          value={row.car_rental_cost}
          className={controlClass}
          placeholder="0.00"
          onChange={(e) =>
            onValueChange(index, "car_rental_cost", e.target.value)
          }
          onBlur={(e) => handleAmountBlur("car_rental_cost", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        />
      </div>

      <div className={rowClass}>
        <label className={labelClass}>Miles</label>
        <input
          type="number"
          value={row.miles}
          className={controlClass}
          placeholder="0"
          onChange={(e) => onValueChange(index, "miles", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        />
      </div>

      <div className={rowClass}>
        <label className={labelClass}>Mileage Amount</label>
        <input
          type="number"
          value={row.miles_cost}
          className={controlClass}
          placeholder="0.00"
          readOnly
          disabled={disabled}
        />
      </div>

      <div className={rowClass}>
        <label className={labelClass}>Perdiem</label>
        <input
          type="number"
          value={row.perdiem_cost}
          className={controlClass}
          placeholder="0.00"
          onChange={(e) => onValueChange(index, "perdiem_cost", e.target.value)}
          onBlur={(e) => handleAmountBlur("perdiem_cost", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        />
      </div>

      <div className={rowClass}>
        <label className={labelClass}>Entertainment</label>
        <input
          type="number"
          value={row.entertainment_cost}
          className={controlClass}
          placeholder="0.00"
          onChange={(e) =>
            onValueChange(index, "entertainment_cost", e.target.value)
          }
          onBlur={(e) => handleAmountBlur("entertainment_cost", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        />
      </div>

      <div className={rowClass}>
        <label className={labelClass}>Misc Desc</label>
        <select
          value={row.miscellaneous_description_id}
          className={controlClass}
          onChange={(e) =>
            onValueChange(index, "miscellaneous_description_id", e.target.value)
          }
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        >
          <option value="Nothing"></option>
          {(miscCtx.miscellaneous || []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.description}
            </option>
          ))}
        </select>
      </div>

      <div className={rowClass}>
        <label className={labelClass}>Misc Amount</label>
        <input
          type="number"
          value={row.miscellaneous_amount}
          className={controlClass}
          placeholder="0.00"
          onChange={(e) =>
            onValueChange(index, "miscellaneous_amount", e.target.value)
          }
          onBlur={(e) => handleAmountBlur("miscellaneous_amount", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        />
      </div>

      <div className={rowClass}>
        <label className={labelClass}>Total</label>
        <input
          type="number"
          value={totalAmount.toFixed(2)}
          className={`${controlClass} text-center`}
          readOnly
          disabled
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
