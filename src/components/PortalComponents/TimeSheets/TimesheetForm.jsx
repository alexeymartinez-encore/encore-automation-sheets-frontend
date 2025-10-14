import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "react-datepicker/dist/react-datepicker.css";
import { TimesheetContext } from "../../../store/timesheet-context";
import AddEntryButton from "./TimesheetForm/AddEntryButton";
import {
  calculateHours,
  formatWeekendDate,
  getEndOfWeek,
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

const initialTimesheetData = {
  approved: false,
  approved_by: "None",
  createdAt: "",
  date_processed: null,
  employee_id: localStorage.getItem("userId"),
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

export default function TimesheetForm({
  timesheetEntriesData = intitialEntriesData,
  timesheetId = null,
  isAdmin = false,
}) {
  const navigate = useNavigate();

  const [timesheet, setTimesheet] = useState(initialTimesheetData);
  const [rowData, setRowData] = useState(timesheetEntriesData);
  const [selectedDate, setSelectedDate] = useState(getEndOfWeek(new Date()));
  const [selectedUser, setSelectedUser] = useState({
    id: null,
    first_name: "",
    last_name: "",
  });

  const timesheetCtx = useContext(TimesheetContext);

  let filteredTimesheet;
  useEffect(() => {
    async function init() {
      if (timesheetEntriesData && timesheetId) {
        filteredTimesheet = timesheetCtx.timesheets.find(
          (timesheet) => timesheet.id === parseInt(timesheetId)
        );

        if (filteredTimesheet) {
          const filteredDate = formatWeekendDate(
            new Date(filteredTimesheet.week_ending)
          );
          setSelectedDate(filteredDate);
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
              const filteredDate = formatWeekendDate(
                new Date(filteredTimesheet.week_ending)
              );
              setSelectedDate(new Date(filteredDate));
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
      timesheet.week_ending = selectedDate;
      timesheet.id = timesheetId || timesheet.id;

      const timesheetRequestBody = {
        timesheetData: timesheet,
        timesheetEntryData: rowData,
      };

      const res = await saveTimesheet(timesheetRequestBody, timesheetId);

      if (res.internalStatus === "success" && res.data) {
        if (!timesheetId) {
          const createdTimesheetId = res.data.timesheet.id;
          navigate(
            `/employee-portal/dashboard/timesheets/${createdTimesheetId}`
          );
          timesheetCtx.triggerUpdate();
        }

        if (timesheetId) {
          setRowData(
            res.data.entries.length > 0 ? res.data.entries : intitialEntriesData
          );
          setTimesheet(
            res.data.timesheet.length > 0
              ? res.data.timesheet
              : initialTimesheetData
          );
        }

        timesheetCtx.triggerSucessOrFailMessage("success", res.message);
        timesheetCtx.triggerUpdate();
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
      navigate("/employee-portal/dashboard/timesheets/create-timesheet", {
        state: {
          prefillEntries: rowData.map((row) => ({
            ...row,
            id: null, // reset so backend treats as new
            timesheet_id: null, // detach from old timesheet
          })),
        },
      });
    } catch (err) {
      console.error("Error copying timesheet:", err);
    }
  }

  return (
    <div className="pb-20">
      <div className="relative flex flex-col md:flex-row gap-5 justify-between px-2 md:px-5 pb-10 items-center ">
        <DatePickerComponent
          onChange={(date) => setSelectedDate(date)}
          selected={formatWeekendDate(selectedDate)}
          disabled={timesheet.approved}
        />
        {isAdmin && (
          <p className="text-red-500 font-bold text-xl">
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
      <FormTable
        data={rowData}
        onValueChange={handleValueChange}
        onDeleteRow={handleDeleteRow}
        timesheetId={timesheetId}
        disabled={timesheet.approved}
      />
      {/* Only On Phone */}
      <FormTableMobile
        data={rowData}
        onValueChange={handleValueChange}
        onDeleteRow={handleDeleteRow}
        timesheetId={timesheetId}
        disabled={timesheet.approved}
      />

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
            <div className="hidden md:block">
              <AddEntryButton onClick={handleAddRow} />
            </div>{" "}
            <div className="block md:hidden">
              <AddEntryButton onClick={handleAddRow} />
            </div>{" "}
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
