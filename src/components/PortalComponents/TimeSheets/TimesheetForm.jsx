import { useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import "react-datepicker/dist/react-datepicker.css";
import { TimesheetContext } from "../../../store/timesheet-context";
import AddEntryButton from "./TimesheetForm/AddEntryButton";
import {
  calculateHours,
  getEndOfWeek,
  getWeekDayDateLabels,
} from "../../../util/helper";
import FormActionsButtons from "../Shared/FormActionButtons";
import FormHoursTotal from "./TimesheetForm/FormHoursTotal";
import FormTable from "./TimesheetForm/FormTable";
import FormTableMobile from "./TimesheetForm/MobileComponents/FormTableMobile";

import {
  deleteTimesheetEntryById,
  saveTimesheet,
} from "../../../util/fetching";
import DatePickerComponent from "../Shared/DatePickerComponent";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

function getInitialTimesheetData(employeeId = null) {
  return {
    approved: false,
    approved_by: "None",
    createdAt: "",
    date_processed: null,
    employee_id: employeeId ?? localStorage.getItem("userId"),
    id: null,
    message: "None",
    processed: false,
    processed_by: "None",
    signed: false,
    submitted_by: "None",
    total_overtime: 0,
    total_reg_hours: 0,
    updatedAt: "",
    week_ending: "",
  };
}

const intitialEntriesData = [
  {
    row_index: 1,
    project_id: 2,
    phase_id: 1,
    cost_code_id: 1,
    description: "",
    mon_reg: 0,
    mon_ot: 0,
    tue_reg: 0,
    tue_ot: 0,
    wed_reg: 0,
    wed_ot: 0,
    thu_reg: 0,
    thu_ot: 0,
    fri_reg: 0,
    fri_ot: 0,
    sat_reg: 0,
    sat_ot: 0,
    sun_reg: 0,
    sun_ot: 0,
    total_hours: 0,
    id: null,
  },
];

function getInitialWeekEndingDate(value) {
  const candidate = value ? new Date(value) : new Date();
  return Number.isNaN(candidate.getTime()) ? getEndOfWeek(new Date()) : getEndOfWeek(candidate);
}

export default function TimesheetForm({
  timesheetEntriesData = intitialEntriesData,
  timesheetId = null,
  isAdmin = false,
  initialSelectedDate = null,
  initialEmployee = null,
}) {
  const allow_overtime = localStorage.getItem("allow_overtime") === "true";
  // console.log(allow_overtime);
  const navigate = useNavigate();
  const initialEmployeeId = initialEmployee?.id ?? null;
  const initialFirstName = initialEmployee?.first_name || "";
  const initialLastName = initialEmployee?.last_name || "";

  const [timesheet, setTimesheet] = useState(() =>
    getInitialTimesheetData(initialEmployeeId)
  );
  const [rowData, setRowData] = useState(timesheetEntriesData);
  const [selectedDate, setSelectedDate] = useState(() =>
    getInitialWeekEndingDate(initialSelectedDate)
  );
  const [selectedUser, setSelectedUser] = useState({
    id: initialEmployeeId,
    first_name: initialFirstName,
    last_name: initialLastName,
  });

  const timesheetCtx = useContext(TimesheetContext);

  useEffect(() => {
    if (timesheetId) {
      return;
    }

    setSelectedDate(getInitialWeekEndingDate(initialSelectedDate));
  }, [initialSelectedDate, timesheetId]);

  useEffect(() => {
    if (timesheetId) {
      return;
    }

    if (initialEmployeeId) {
      setTimesheet((prevTimesheet) => ({
        ...prevTimesheet,
        employee_id: Number(initialEmployeeId),
      }));
      setSelectedUser({
        id: Number(initialEmployeeId),
        first_name: initialFirstName,
        last_name: initialLastName,
      });
      return;
    }

    setTimesheet((prevTimesheet) => ({
      ...prevTimesheet,
      employee_id: localStorage.getItem("userId"),
    }));
    setSelectedUser({
      id: null,
      first_name: "",
      last_name: "",
    });
  }, [
    initialEmployeeId,
    initialFirstName,
    initialLastName,
    isAdmin,
    timesheetId,
  ]);

  useEffect(() => {
    async function init() {
      if (timesheetEntriesData && timesheetId) {
        let filteredTimesheet = timesheetCtx.timesheets.find(
          (timesheet) => timesheet.id === parseInt(timesheetId)
        );

        if (filteredTimesheet) {
          setSelectedDate(getEndOfWeek(new Date(filteredTimesheet.week_ending)));
          setTimesheet((prevTimesheet) => ({
            ...prevTimesheet,
            signed: filteredTimesheet.signed,
            total_reg_hours: filteredTimesheet.total_reg_hours,
            total_overtime: filteredTimesheet.total_overtime,
            approved: filteredTimesheet.approved,
          }));
        } else {
          try {
            const response = await fetch(
              `${BASE_URL}/admin/timesheet/${timesheetId}`,
              {
                headers: { "Content-Type": "application/json" },
                credentials: "include",
              }
            );
            const data = await response.json();
            if (response.ok) {
              filteredTimesheet = data.data[0];
              setSelectedUser(data.data[0].Employee);
              setSelectedDate(
                getEndOfWeek(new Date(filteredTimesheet.week_ending))
              );
              setTimesheet(filteredTimesheet);
            } else {
              console.error("Error fetching expense");
              return;
            }
          } catch (error) {
            console.error("Error fetching expense:", error);
            return;
          }
        }
        setRowData(timesheetEntriesData);
      }
    }
    init();
  }, [timesheetEntriesData, timesheetId, timesheetCtx.timesheets]);

  async function handleSave() {
    try {
      const hours = calculateHours(rowData);
      timesheet.total_reg_hours = hours.totalRegHours;
      timesheet.total_overtime = hours.totalOvertime;
      timesheet.submitted_by = timesheet.signed
        ? localStorage.getItem("user_name")
        : "None";
      timesheet.employee_id = isAdmin
        ? timesheet.employee_id
        : localStorage.getItem("userId");
      timesheet.week_ending = getEndOfWeek(selectedDate);
      timesheet.id = timesheetId || timesheet.id;

      const timesheetRequestBody = {
        timesheetData: timesheet,
        timesheetEntryData: rowData,
      };

      const res = await saveTimesheet(timesheetRequestBody, timesheetId);

      if (res.internalStatus === "success" && res.data) {
        if (!timesheetId) {
          const createdTimesheetId = res.data.timesheet.id;
          const adminQuery = isAdmin ? "?adminMode=true" : "";
          navigate(
            `/employee-portal/dashboard/timesheets/details/${createdTimesheetId}${adminQuery}`
          );
        }

        if (timesheetId) {
          setRowData(
            res.data.entries.length > 0 ? res.data.entries : intitialEntriesData
          );
          setTimesheet(
            res.data.timesheet.length > 0
              ? res.data.timesheet
              : getInitialTimesheetData(initialEmployeeId)
          );
        }

        await timesheetCtx.fetchTimesheets();
        timesheetCtx.triggerSucessOrFailMessage("success", res.message);
      } else {
        timesheetCtx.triggerSucessOrFailMessage(
          "fail",
          res.message || "Unknown error saving timesheet."
        );
      }
    } catch (error) {
      timesheetCtx.triggerSucessOrFailMessage(
        "fail",
        `Timesheet ${
          timesheetId || timesheet.id ? "update" : "creation"
        } failed!`
      );
      console.error("Error saving timesheet:", error);
    }
  }

  function handleSign() {
    setTimesheet((prevTimesheet) => ({
      ...prevTimesheet,
      signed: !prevTimesheet.signed,
      submitted_by: localStorage.getItem("user_name"),
    }));
  }

  function handleAddRow() {
    setRowData((prevData) => [
      ...prevData,
      {
        ...intitialEntriesData[0],
        row_index: prevData.length + 1,
      },
    ]);
  }

  async function handleDeleteRow(index, row) {
    if (row.id) {
      try {
        await deleteTimesheetEntryById(index, row);
      } catch (error) {
        console.error("Error deleting row from the server: ", error);
        return;
      }
    }
    setRowData((prevData) => prevData.filter((_, i) => i !== index));
  }

  function handleValueChange(index, field, value) {
    // Minimal numeric coercion for *_id fields (prevents sending "1" instead of 1)
    const numericIdFields = new Set([
      "project_id",
      "phase_id",
      "cost_code_id",
      "row_index",
      "id",
      "timesheet_id",
    ]);
    const nextValue = numericIdFields.has(field) ? Number(value) : value;

    setRowData((prevData) =>
      prevData.map((row, i) => {
        if (i === index) {
          const updatedRow = { ...row, [field]: nextValue };
          const totalHours =
            Number(updatedRow.mon_reg || 0) +
            Number(updatedRow.mon_ot || 0) +
            Number(updatedRow.tue_reg || 0) +
            Number(updatedRow.tue_ot || 0) +
            Number(updatedRow.wed_reg || 0) +
            Number(updatedRow.wed_ot || 0) +
            Number(updatedRow.thu_reg || 0) +
            Number(updatedRow.thu_ot || 0) +
            Number(updatedRow.fri_reg || 0) +
            Number(updatedRow.fri_ot || 0) +
            Number(updatedRow.sat_reg || 0) +
            Number(updatedRow.sat_ot || 0) +
            Number(updatedRow.sun_reg || 0) +
            Number(updatedRow.sun_ot || 0);
          return { ...updatedRow, total_hours: totalHours };
        }
        return row;
      })
    );
  }

  async function handleCopy() {
    try {
      const nextState = {
        prefillEntries: rowData.map((row) => ({
          ...row,
          id: null, // reset so backend treats as new
          timesheet_id: null, // detach from old timesheet
        })),
        prefillDate: selectedDate,
      };

      if (isAdmin) {
        nextState.adminCreate = {
          employeeId: Number(timesheet.employee_id || selectedUser.id),
          first_name: selectedUser.first_name || "",
          last_name: selectedUser.last_name || "",
        };
      }

      navigate("/employee-portal/dashboard/timesheets/create-timesheet", {
        state: nextState,
      });
    } catch (err) {
      console.error("Error copying timesheet:", err);
    }
  }

  const weekDayDateLabels = getWeekDayDateLabels(selectedDate);

  return (
    <div className="pb-16 md:pb-20">
      <div className="relative flex flex-col xl:flex-row gap-3 xl:gap-5 justify-between px-2 md:px-5 pb-5 items-stretch xl:items-center">
        <DatePickerComponent
          onChange={(date) => date && setSelectedDate(getEndOfWeek(date))}
          selected={selectedDate}
          disabled={timesheet.approved}
        />
        {isAdmin && (
          <p className="text-red-500 font-bold text-base md:text-xl text-center xl:text-left">
            {selectedUser.first_name} {selectedUser.last_name}
          </p>
        )}
        <FormActionsButtons
          handleSave={handleSave}
          handleSign={handleSign}
          signed={timesheet.signed}
          disabled={timesheet.approved}
          href={"/employee-portal/dashboard/timesheets/create-timesheet"}
          // rowData={rowData}
          handleCopy={handleCopy}
        />
      </div>
      {!allow_overtime && (
        <div className="flex items-center justify-center p-1 rounded-md bg-yellow-600 text-white mx-2  md:mx-5 mb-5 text-center">
          <p>Overtime Not allowed</p>
        </div>
      )}
      <div className="hidden md:block px-2 md:px-5">
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <FormTable
            data={rowData}
            onValueChange={handleValueChange}
            onDeleteRow={handleDeleteRow}
            disabled={timesheet.approved}
            dayLabels={weekDayDateLabels}
          />
        </div>
      </div>
      <div className="md:hidden px-2">
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <FormTableMobile
            data={rowData}
            onValueChange={handleValueChange}
            onDeleteRow={handleDeleteRow}
            disabled={timesheet.approved}
            dayLabels={weekDayDateLabels}
          />
        </div>
      </div>

      <div
        className={`flex md:flex-row flex-col ${
          timesheet.approved
            ? "justify-end my-5"
            : "justify-center md:justify-between my-5 md:my-0"
        } gap-5 items-center px-3 md:px-5`}
      >
        {timesheet.approved ? (
          <> </>
        ) : (
          <>
            <div>
              <AddEntryButton onClick={handleAddRow} />
            </div>
          </>
        )}
        <div className="flex items-center justify-between md:justify-end gap-2">
          <FormHoursTotal description={"Reg:"} textColor="text-blue-500">
            {calculateHours(rowData).totalRegHours}
          </FormHoursTotal>
          <FormHoursTotal description={"OT:"} textColor="text-red-500">
            {calculateHours(rowData).totalOvertime}
          </FormHoursTotal>
        </div>
      </div>
    </div>
  );
}

TimesheetForm.propTypes = {
  timesheetEntriesData: PropTypes.array,
  timesheetId: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.oneOf([null]),
  ]),
  isAdmin: PropTypes.bool,
  initialSelectedDate: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
    PropTypes.oneOf([null]),
  ]),
  initialEmployee: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    first_name: PropTypes.string,
    last_name: PropTypes.string,
  }),
};
