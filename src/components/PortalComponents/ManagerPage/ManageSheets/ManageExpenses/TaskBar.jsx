import React, { forwardRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faCheck,
  faDollarSign,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateNavigationBtns from "../ManageSheetsShared/DateNavigationBtns";
import { TbReportMoney } from "react-icons/tb";

// Custom Input for the DatePicker
const CustomInput = forwardRef(({ onClick }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className="flex items-center  text-center rounded-md py-1 px-2  "
  >
    <FontAwesomeIcon
      icon={faCalendarAlt}
      className="text-blue-500 h-4 md:h-5"
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
}) {
  // const isSunday = (date) => date.getDay() === 0;
  const isFirstDayOfMonth = (date) => date.getDate() === 1;

  return (
    <div className=" flex flex-col md:flex-row  justify-around items-center gap-5 bg-white p-3 border-b rounded-md text-xs my-1 space-y-2">
      {/* Date Picker */}
      <div className="flex items-center space-x-4 w-full">
        <button
          onClick={handleToggle}
          className="border py-1 w-20 px-1 md:w-32 rounded-md hover:bg-blue-500 hover:text-white transition duration-400 text-[0.5rem] md:text-xs"
        >
          {expenseMode}
        </button>
        <DatePicker
          selected={selectedDate}
          onChange={onChange}
          customInput={<CustomInput />}
          placeholderText="Select date"
          popperPlacement="bottom-end" // Change the placement here
          filterDate={isFirstDayOfMonth}
          dateFormat="dd MMMM yyyy" // Display as Month Year
          showMonthYearPicker // Optional: pick by month
        />
        <DateNavigationBtns
          goToNext={goToNextMonth}
          goToPrevious={goToPreviousMonth}
          date={selectedDate}
          handleState={isToggled}
        />
      </div>

      <div className="flex justify-around w-full">
        {/* <FontAwesomeIcon icon={faClock} className="text-blue-500 h-5" /> */}
        <button type="button" title="Save Status Changes" onClick={saveChanges}>
          <FontAwesomeIcon
            icon={faSave}
            className="text-blue-500 h-5 hover:text-blue-900 transition duration-500 size-5"
          />
        </button>
        <button
          type="button"
          title="Set All to Approved"
          onClick={setAllApproved}
        >
          <FontAwesomeIcon
            icon={faCheck}
            className="text-orange-500 h-5 hover:text-orange-900 transition duration-500 size-5"
          />
        </button>
        <button type="button" title="Set All to Paid" onClick={setAllPaid}>
          <FontAwesomeIcon
            icon={faDollarSign}
            className="text-orange-500 h-5 hover:text-orange-900 transition duration-500 size-4"
          />
        </button>
        <button
          type="button"
          title="Generate Expense Report"
          onClick={generateReport}
        >
          <TbReportMoney className="text-green-500 h-5 hover:text-green-700 transition duration-500 size-6" />
        </button>
      </div>
    </div>
  );
}
