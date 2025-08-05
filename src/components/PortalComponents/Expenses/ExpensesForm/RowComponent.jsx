import React, { useContext } from "react";
import { MiscellaneousContext } from "../../../../store/miscellaneous-context";

export default function RowComponent({
  row,
  index,
  onValueChange,
  onAddSubRow,
}) {
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
  // console.log(row);

  // console.log("MISCELLANEOUS", miscCtx.miscellaneous);
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

  return (
    <tr className="bg-white text-xs overflow-scroll">
      <td className="border px-0 text-center">
        <button className="text-indigo-600" onClick={onAddSubRow}>
          +
        </button>
      </td>
      <td className="border px-0 text-center">{row.day}</td>
      <td className="border px-2">
        <select
          value={row.project_id}
          className="w-full text-center px-0"
          onChange={(e) => onValueChange(index, "project_id", e.target.value)}
          onKeyDown={handleEnterKeyFocus}
        >
          <option value="Nothing"></option>
          {miscCtx.projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.number}
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
          />
          <input
            type="decimal"
            value={row.destination_cost}
            onChange={(e) =>
              onValueChange(index, "destination_cost", e.target.value)
            }
            className="w-full text-center  px-2"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
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
            className="w-full text-center  px-2"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
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
            className="w-full text-center  px-2"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
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
            className="w-full text-center  px-2"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
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
          />
          <input
            type="decimal"
            value={(row.miles * 0.58).toFixed(2)}
            onChange={(e) => onValueChange(index, "miles_cost", e.target.value)}
            className="w-full text-center  px-2"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
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
            className="w-full text-center  px-2"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
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
            className="w-full text-center  px-0"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
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
            className="w-full text-center  px-2"
            placeholder="$"
            onKeyDown={handleEnterKeyFocus}
          />
        </div>
      </td>
      <th className="border  px-2 text-center">{totalAmount}</th>
    </tr>
  );
}
