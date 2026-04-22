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
import { TbReportMoney } from "react-icons/tb";

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

CustomInput.displayName = "ExpenseTaskBarDateInput";
CustomInput.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

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
  totalEmployeesCount,
  totalExpenseAmount,
  toggleMissingPanel,
  isMissingPanelOpen,
  missingButtonDisabled,
}) {
  const isFirstDayOfMonth = (date) => date.getDate() === 1;
  const totalExpenses = Number(totalEmployeesCount) || 0;
  const formattedExpenseTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(totalExpenseAmount) || 0);
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
    <div className="overflow-visible rounded-md border-b bg-white text-xs my-1">
      <div className="flex flex-col items-center justify-center gap-3 border-b px-3 py-3 sm:flex-row lg:justify-between">
        <button
          onClick={handleToggle}
          className="w-full max-w-44 rounded-md border bg-blue-500 px-3 py-2 text-[0.7rem] text-white transition duration-400 hover:bg-blue-400 md:text-xs lg:max-w-none lg:flex-1"
        >
          {expenseMode}
        </button>
        <div className="flex w-full items-center justify-center sm:w-auto lg:flex-1">
          <DatePicker
            selected={selectedDate}
            onChange={onChange}
            customInput={<CustomInput />}
            placeholderText="Select date"
            popperPlacement="bottom-end"
            filterDate={isFirstDayOfMonth}
            dateFormat="dd MMMM yyyy"
            showMonthYearPicker
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
          <button
            type="button"
            title="Generate Expense Report"
            onClick={generateReport}
          >
            <TbReportMoney className="text-green-500 hover:text-green-700 transition duration-500 size-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-[0.7rem] md:text-xs font-medium text-blue-700">
            Signed{" "}
            <span className="font-semibold text-slate-900">
              {completeExpenses} / {totalExpenses}
            </span>{" "}
            active
          </div>

          <div className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-[0.7rem] md:text-xs font-medium text-emerald-700">
            {isToggled ? "Open Total" : "Month Total"}{" "}
            <span className="font-semibold text-slate-900">
              {formattedExpenseTotal}
            </span>
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
                : "See active employees missing this month's expense sheet."
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
              <TbReportMoney className="size-4" />
              <span>Reports</span>
              <FontAwesomeIcon icon={faChevronDown} />
            </button>

            {isOpen ? (
              <div className="absolute right-0 mt-1 w-40 bg-white border rounded-md shadow-lg z-50">
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={generateReport}
                >
                  Expense Report
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
  goToNextMonth: PropTypes.func.isRequired,
  goToPreviousMonth: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  saveChanges: PropTypes.func.isRequired,
  setAllApproved: PropTypes.func.isRequired,
  setAllPaid: PropTypes.func.isRequired,
  generateReport: PropTypes.func.isRequired,
  isToggled: PropTypes.bool.isRequired,
  handleToggle: PropTypes.func.isRequired,
  expenseMode: PropTypes.string.isRequired,
  completeExpenses: PropTypes.number.isRequired,
  totalEmployeesCount: PropTypes.number,
  totalExpenseAmount: PropTypes.number.isRequired,
  toggleMissingPanel: PropTypes.func.isRequired,
  isMissingPanelOpen: PropTypes.bool.isRequired,
  missingButtonDisabled: PropTypes.bool.isRequired,
};
