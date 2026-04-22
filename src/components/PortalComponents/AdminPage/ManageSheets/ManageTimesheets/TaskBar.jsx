import PropTypes from "prop-types";
import { forwardRef, useEffect, useRef, useState } from "react";
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
import { TbReport } from "react-icons/tb";

const CustomInput = forwardRef(({ onClick, disabled }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center text-center rounded-md py-1 px-2 transition ${
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

CustomInput.displayName = "TimesheetTaskBarDateInput";
CustomInput.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

export default function TaskBar({
  onChange,
  goToNextWeek,
  goToPreviousWeek,
  selectedDate,
  saveChanges,
  setAllApproved,
  setAllPaid,
  generateReport,
  handleToggle,
  timesheetMode,
  isToggled,
  completeTimesheets,
  openReportModal,
  totalEmployeesCount,
  toggleMissingPanel,
  isMissingPanelOpen,
  missingButtonDisabled,
}) {
  const isSunday = (date) => date.getDay() === 0;
  const totalTimesheets = Number(totalEmployeesCount) || 0;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (reportType) => {
    openReportModal(reportType);
    setIsOpen(false);
  };

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
    <div className="overflow-visible rounded-md border-b bg-white text-xs my-1">
      <div className="flex flex-col items-center justify-center gap-3 border-b px-3 py-3 sm:flex-row lg:justify-between">
        <button
          onClick={handleToggle}
          className="w-full max-w-44 rounded-md border bg-blue-500 px-3 py-2 text-[0.7rem] text-white transition duration-400 hover:bg-blue-400 md:text-xs lg:max-w-none lg:flex-1"
        >
          {timesheetMode}
        </button>
        <div className="flex w-full items-center justify-center sm:w-auto lg:flex-1">
          <DatePicker
            selected={selectedDate}
            onChange={onChange}
            customInput={<CustomInput />}
            placeholderText="Select date"
            popperPlacement="bottom-end"
            filterDate={isSunday}
            disabled={isToggled}
          />
          <DateNavigationBtns
            goToPrevious={goToPreviousWeek}
            goToNext={goToNextWeek}
            date={selectedDate}
            handleState={isToggled}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 px-3 py-3 sm:flex-row sm:flex-wrap sm:justify-center">
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
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-[0.7rem] md:text-xs font-medium text-blue-700">
            Signed{" "}
            <span className="font-semibold text-slate-900">
              {completeTimesheets} / {totalTimesheets}
            </span>{" "}
            active
          </div>

          <button
            type="button"
            onClick={toggleMissingPanel}
            disabled={missingButtonDisabled}
            className={`rounded-md border px-3 py-2 text-[0.7rem] md:text-xs font-medium transition ${
              missingButtonDisabled
                ? "cursor-not-allowed border-gray-200 text-gray-400"
                : isMissingPanelOpen
                ? "border-amber-500 bg-amber-500 text-white"
                : "border-amber-300 text-amber-800 hover:bg-amber-50"
            }`}
            title={
              missingButtonDisabled
                ? "Switch back to By Date mode to audit missing submissions."
                : "See active employees missing this week's timesheet."
            }
          >
            {isMissingPanelOpen ? "Hide Missing" : "See Who's Missing"}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen((currentValue) => !currentValue)}
              className="flex items-center gap-1 rounded-md border px-3 py-2 text-[0.7rem] md:text-xs font-medium transition hover:border-blue-500 hover:bg-blue-500 hover:text-white"
            >
              <TbReport className="size-4" />
              <span>Reports</span>
              <FontAwesomeIcon icon={faChevronDown} />
            </button>

            {isOpen ? (
              <div className="absolute right-0 mt-1 w-40 bg-white border rounded-md shadow-lg z-50">
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={generateReport}
                >
                  Labor Report
                </button>
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleSelect("overtime")}
                >
                  Overtime Report
                </button>
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleSelect("bereavement")}
                >
                  Bereavement Report
                </button>
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleSelect("vacation")}
                >
                  Vacation Report
                </button>
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleSelect("juryduty")}
                >
                  Jury Duty Report
                </button>
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleSelect("sick")}
                >
                  Sick Report
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

TaskBar.propTypes = {
  onChange: PropTypes.func.isRequired,
  goToNextWeek: PropTypes.func.isRequired,
  goToPreviousWeek: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  saveChanges: PropTypes.func.isRequired,
  setAllApproved: PropTypes.func.isRequired,
  setAllPaid: PropTypes.func.isRequired,
  generateReport: PropTypes.func.isRequired,
  handleToggle: PropTypes.func.isRequired,
  timesheetMode: PropTypes.string.isRequired,
  isToggled: PropTypes.bool.isRequired,
  completeTimesheets: PropTypes.number.isRequired,
  openReportModal: PropTypes.func.isRequired,
  totalEmployeesCount: PropTypes.number,
  toggleMissingPanel: PropTypes.func.isRequired,
  isMissingPanelOpen: PropTypes.bool.isRequired,
  missingButtonDisabled: PropTypes.bool.isRequired,
};
