import React, { useContext, useState } from "react";
import { MiscellaneousContext } from "../../../../store/miscellaneous-context";

export default function RowComponent({
  row,
  index,
  onValueChange,
  onAddSubRow,
  onDeleteRow,
  disabled,
}) {
  const [isActive, setIsActive] = useState(false);
  const role = Number(localStorage.getItem("role_id"));

  const miscCtx = useContext(MiscellaneousContext);
  const totalAmount =
    Number(row.destination_cost || 0) +
    Number(row.lodging_cost || 0) +
    Number(row.other_expense_cost || 0) +
    Number(row.car_rental_cost || 0) +
    Number(row.miles_cost || 0) +
    Number(row.perdiem_cost || 0) +
    Number(row.entertainment_cost || 0) +
    Number(row.miscellaneous_amount || 0);

  function handleEnterKeyFocus(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const formElements = Array.from(
        e.target
          .closest("tr") // limit scope to current row
          .querySelectorAll("input, select, textarea, button")
      ).filter((el) => !el.disabled && el.tabIndex !== -1);

      const currentIndex = formElements.indexOf(e.target);
      const nextElement = formElements[currentIndex + 1];
      if (nextElement) {
        nextElement.focus();
      }
    }
  }

  function handleRowFocus() {
    setIsActive(true);
  }
  function handleRowBlur() {
    setIsActive(false);
  }

  return (
    <tr
      className={`text-xs overflow-scroll ${
        isActive ? "bg-blue-200" : "bg-white"
      }`}
      onFocus={handleRowFocus}
      onBlur={handleRowBlur}
    >
      <td className={`border px-0 text-center `}>
        <button
          className={` ${disabled ? " text-red-200/90" : "text-red-600"}`}
          onClick={onDeleteRow}
          disabled={disabled}
        >
          -
        </button>
      </td>
      <td className={`border px-0 text-center `}>
        <button
          className={` ${disabled ? " text-indigo-200/90" : "text-indigo-600"}`}
          onClick={onAddSubRow}
          disabled={disabled}
        >
          +
        </button>
      </td>
      <td className="border px-0 text-center">{row.day}</td>
      <td className="border px-2">
        <select
          value={row.project_id}
          className="w-full text-start px-0"
          onChange={(e) => onValueChange(index, "project_id", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        >
          <option value="Nothing"></option>

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
      <td className="border px-1 text-center">
        <input
          type="text"
          value={row.purpose}
          placeholder="Describe Purpose"
          className="w-full text-center"
          onChange={(e) => onValueChange(index, "purpose", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
          disabled={disabled}
        />
      </td>
      <td className="border items-center px-2">
        <div className="flex  justify-center gap-5 font-light">
          <input
            type="text"
            value={row.destination_name}
            className="w-full text-center  px-2"
            placeholder="To/From"
            onChange={(e) =>
              onValueChange(index, "destination_name", e.target.value)
            }
            onKeyDown={handleEnterKeyFocus}
            disabled={disabled}
          />
          <input
            type="decimal"
            value={row.destination_cost}
            onChange={(e) =>
              onValueChange(index, "destination_cost", e.target.value)
            }
            onBlur={(e) => {
              const value = parseFloat(e.target.value) || 0;
              const formatted = value.toFixed(2);
              onValueChange(index, "destination_cost", formatted);
            }}
            className="w-full text-center  px-2"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
            disabled={disabled}
          />
        </div>
      </td>
      <td className="border px-2 ">
        <div className="flex  justify-center gap-5 font-light">
          <input
            type="decimal"
            value={row.lodging_cost}
            onChange={(e) =>
              onValueChange(index, "lodging_cost", e.target.value)
            }
            onBlur={(e) => {
              const value = parseFloat(e.target.value) || 0;
              const formatted = value.toFixed(2);
              onValueChange(index, "lodging_cost", formatted);
            }}
            className="w-full text-center  px-2"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
            disabled={disabled}
          />
        </div>
      </td>
      <td className="border px-2 text-center">
        <div className="flex  justify-center gap-5 font-light">
          <input
            type="decimal"
            value={row.other_expense_cost}
            onChange={(e) =>
              onValueChange(index, "other_expense_cost", e.target.value)
            }
            onBlur={(e) => {
              const value = parseFloat(e.target.value) || 0;
              const formatted = value.toFixed(2);
              onValueChange(index, "other_expense_cost", formatted);
            }}
            className="w-full text-center  px-2"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
            disabled={disabled}
          />
        </div>
      </td>
      <td className="border px-2">
        <div className="flex  justify-center gap-5 font-light">
          <input
            type="decimal"
            value={row.car_rental_cost}
            onChange={(e) =>
              onValueChange(index, "car_rental_cost", e.target.value)
            }
            onBlur={(e) => {
              const value = parseFloat(e.target.value) || 0;
              const formatted = value.toFixed(2);
              onValueChange(index, "car_rental_cost", formatted);
            }}
            className="w-full text-center  px-2"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
            disabled={disabled}
          />
        </div>
      </td>
      <td className="border px-2">
        <div className="flex justify-center gap-5 font-light">
          <input
            type="decimal"
            value={row.miles}
            onChange={(e) => onValueChange(index, "miles", e.target.value)}
            className="w-full text-center  px-2"
            placeholder="miles"
            onKeyDown={handleEnterKeyFocus}
            disabled={disabled}
          />
          <input
            type="decimal"
            value={(row.miles * 0.58).toFixed(2)}
            onChange={(e) => onValueChange(index, "miles_cost", e.target.value)}
            className="w-full text-center  px-2"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
            disabled={disabled}
          />
        </div>
      </td>
      <td className="border px-2">
        <div className="flex  justify-center gap-5 font-light">
          <input
            type="decimal"
            value={row.perdiem_cost}
            onChange={(e) =>
              onValueChange(index, "perdiem_cost", e.target.value)
            }
            onBlur={(e) => {
              const value = parseFloat(e.target.value) || 0;
              const formatted = value.toFixed(2);
              onValueChange(index, "perdiem_cost", formatted);
            }}
            className="w-full text-center  px-2"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
            disabled={disabled}
          />
        </div>
      </td>
      <td className="border px-2">
        <div className="flex justify-center font-light">
          <input
            type="decimal"
            value={row.entertainment_cost}
            onChange={(e) =>
              onValueChange(index, "entertainment_cost", e.target.value)
            }
            onBlur={(e) => {
              const value = parseFloat(e.target.value) || 0;
              const formatted = value.toFixed(2);
              onValueChange(index, "entertainment_cost", formatted);
            }}
            className="w-full text-center  px-0"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
            disabled={disabled}
          />
        </div>
      </td>
      <td className="border px-2">
        <div className="flex  justify-around gap-5 font-light">
          {/* <button className="bg-blue-500 w-full text-white px-0 py-0 text-sm rounded-sm hover:bg-blue-400 duration-500">
            Add
          </button> */}
          <select
            value={row.miscellaneous_description_id}
            className="w-full text-center px-2"
            onChange={(e) =>
              onValueChange(
                index,
                "miscellaneous_description_id",
                e.target.value
              )
            }
            onKeyDown={handleEnterKeyFocus}
            disabled={disabled}
          >
            <option value="Nothing"></option>
            {miscCtx.miscellaneous.map((project) => (
              <option key={project.id} value={project.id}>
                {project.description}
              </option>
            ))}
          </select>
          <input
            type="decimal"
            value={row.miscellaneous_amount}
            onChange={(e) =>
              onValueChange(index, "miscellaneous_amount", e.target.value)
            }
            onBlur={(e) => {
              const value = parseFloat(e.target.value) || 0;
              const formatted = value.toFixed(2);
              onValueChange(index, "miscellaneous_amount", formatted);
            }}
            className="w-full text-center  px-2"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
            disabled={disabled}
          />
        </div>
      </td>
      <th className="border  px-2 text-center">{totalAmount.toFixed(2)}</th>
    </tr>
  );
}
