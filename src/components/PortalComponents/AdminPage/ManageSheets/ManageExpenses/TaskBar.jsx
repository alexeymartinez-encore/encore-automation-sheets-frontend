import React, { forwardRef, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faCheck,
  faDollarSign,
  faSave,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateNavigationBtns from "../ManageSheetsShared/DateNavigationBtns";
import { TbReportMoney } from "react-icons/tb";

// Custom Input for the DatePicker
const CustomInput = forwardRef(({ onClick, disabled }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center text-center rounded-md py-1 px-2 transition
      ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-gray-100 focus:ring-2 focus:ring-blue-400"
      }`}
  >
    <FontAwesomeIcon
      icon={faCalendarAlt}
      className={`h-4 md:h-5 ${disabled ? "text-blue-400" : "text-blue-500"}`}
    />
  </button>
));

export default function TaskBar({
  onChange,
  goToNextMonth,
  goToPreviousMonth,
  selectedDate,
  saveChanges,
  setAllApproved,
  setAllPaid,
  generateReport,
  isToggled,
  handleToggle,
  expenseMode,
  completeExpenses,
}) {
  // const isSunday = (date) => date.getDay() === 0;
  const isFirstDayOfMonth = (date) => date.getDate() === 1;
  const totalExpenses = localStorage.getItem("total_employees");
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className=" flex flex-col justify-between  md:justify-center items-center gap-1 bg-white p-3 border-b rounded-md text-xs my-1 space-y-2">
      <div className="flex items-center justify-between gap-0 w-full border-b py-3">
        <button
          onClick={handleToggle}
          className="border py-2 w-full px-1 mr-5 rounded-md bg-blue-500 text-white hover:bg-blue-400 transition duration-400 text-[0.5rem] md:text-xs"
        >
          {expenseMode}
        </button>
        <div className="flex items-center w-full">
          <DatePicker
            selected={selectedDate}
            onChange={onChange}
            customInput={<CustomInput />}
            placeholderText="Select date"
            // popperPlacement="bottom-end" // Change the placement here
            filterDate={isFirstDayOfMonth}
            dateFormat="dd MMMM yyyy" // Display as Month Year
            showMonthYearPicker // Optional: pick by month
            disabled={isToggled}
            className={`${isToggled ? "text-blue-500/50" : ""}`}
          />
          <DateNavigationBtns
            goToNext={goToNextMonth}
            goToPrevious={goToPreviousMonth}
            date={selectedDate}
            handleState={isToggled}
          />
        </div>
        <div className="border text-[0.6rem] md:text-[1rem] text-blue-500 py-1 md:py-2 flex flex-wrap justify-center  md:gap-2 w-full rounded-sm ml-5">
          <p className="">Signed:</p>
          <p className="">
            {completeExpenses} / {totalExpenses}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center gap-5 w-full">
        <div className="flex justify-center items-center gap-3 border px-5 py-1 rounded-md">
          <button
            type="button"
            title="Save Status Changes"
            onClick={saveChanges}
          >
            <FontAwesomeIcon
              icon={faSave}
              className="text-blue-500 hover:text-blue-900 transition duration-500 size-4"
            />
          </button>
          <button
            type="button"
            title="Set All to Approved"
            onClick={setAllApproved}
          >
            <FontAwesomeIcon
              icon={faCheck}
              className="text-orange-500 hover:text-orange-900 transition duration-500 size-4"
            />
          </button>
          <button type="button" title="Set All to Paid" onClick={setAllPaid}>
            <FontAwesomeIcon
              icon={faDollarSign}
              className="text-orange-500 hover:text-orange-900 transition duration-500 size-4"
            />
          </button>
          <button
            type="button"
            title="Generate Expense Report"
            onClick={generateReport}
          >
            <TbReportMoney className="text-green-500 hover:text-green-700 transition duration-500 size-4" />
          </button>
        </div>
        {/* Reports Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-md border px-2 py-1 rounded-md hover:bg-blue-500 hover:text-white transition "
          >
            <TbReportMoney className="size-4" />
            <span>Reports</span>
            <FontAwesomeIcon icon={faChevronDown} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white border rounded-md shadow-lg z-50">
              <button
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                onClick={generateReport}
              >
                Expense Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
