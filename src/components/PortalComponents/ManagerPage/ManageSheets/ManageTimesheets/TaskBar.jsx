import React, { forwardRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faCheck,
  faClock,
  faDollarSign,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateNavigationBtns from "../ManageSheetsShared/DateNavigationBtns";
import { TbReport } from "react-icons/tb";

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
  goToNextWeek,
  goToPreviousWeek,
  selectedDate,
  viewOvertime,
  saveChanges,
  setAllApproved,
  setAllPaid,
  generateReport,
}) {
  const isSunday = (date) => date.getDay() === 0;

  return (
    <div className=" flex flex-col md:flex-row justify-around items-center gap-5 bg-white p-3 border-b rounded-md text-xs my-1 space-y-2">
      {/* Date Picker */}
      <div className="flex items-center justify-around gap-5 w-full">
        <DatePicker
          selected={selectedDate}
          onChange={onChange}
          customInput={<CustomInput />}
          placeholderText="Select date"
          popperPlacement="bottom-end" // Change the placement here
          filterDate={isSunday}
        />
        <DateNavigationBtns
          goToPrevious={goToPreviousWeek}
          goToNext={goToNextWeek}
          date={selectedDate}
        />
      </div>

      <div className="flex justify-around w-full">
        <button type="button" title="View Overtime Data" onClick={viewOvertime}>
          <FontAwesomeIcon
            icon={faClock}
            className="text-purple-500 h-5 hover:text-purple-900 transition duration-500 size-4"
          />
        </button>
        <button type="button" title="Save Status Changes" onClick={saveChanges}>
          <FontAwesomeIcon
            icon={faSave}
            className="text-blue-500 h-5 hover:text-blue-900 transition duration-500 size-4"
          />
        </button>
        <button
          type="button"
          title="Set All to Approved"
          onClick={setAllApproved}
        >
          <FontAwesomeIcon
            icon={faCheck}
            className="text-orange-500 h-5 hover:text-orange-900 transition duration-500 size-4"
          />
        </button>
        <button type="button" title="Set All to Paid" onClick={setAllPaid}>
          <FontAwesomeIcon
            icon={faDollarSign}
            className="text-orange-500 h-5 hover:text-orange-900 transition duration-500 size-3"
          />
        </button>
        <button
          type="button"
          title="Generate Labor Report"
          onClick={generateReport}
        >
          <TbReport className="text-green-500 h-5 hover:text-green-700 transition duration-500 size-6" />
        </button>
      </div>
    </div>
  );
}
