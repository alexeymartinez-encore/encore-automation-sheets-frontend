import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

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
import {
  deleteTimesheetEntryById,
  saveTimesheet,
} from "../../../util/fetching";
import DatePickerComponent from "../Shared/DatePickerComponent";

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
}) {
  const navigate = useNavigate();

  const [timesheet, setTimesheet] = useState(initialTimesheetData);
  const [rowData, setRowData] = useState(timesheetEntriesData);
  const [selectedDate, setSelectedDate] = useState(getEndOfWeek(new Date()));
  // const { timesheets } = useContext(TimesheetContext);

  const timesheetCtx = useContext(TimesheetContext);

  let filteredTimesheet;
  useEffect(() => {
    if (timesheetEntriesData && timesheetId && timesheetCtx.timesheets.length) {
      filteredTimesheet = timesheetCtx.timesheets.find(
        (timesheet) => timesheet.id === parseInt(timesheetId)
      );
      if (filteredTimesheet) {
        const filteredDate = formatWeekendDate(
          new Date(filteredTimesheet.week_ending)
        );
        setSelectedDate(filteredDate);
        setTimesheet((prevTimesheet) => ({
          ...prevTimesheet, // Keep all other fields unchanged
          signed: filteredTimesheet.signed, // Toggle the signed field
          total_reg_hours: filteredTimesheet.total_reg_hours,
          total_overtime: filteredTimesheet.total_overtime,
          approved: filteredTimesheet.approved,
        }));
        // setSigned(filteredTimesheet.signed);
      }
      setRowData(timesheetEntriesData);
    }
  }, [timesheetEntriesData, timesheetId, timesheetCtx.timesheets]);

  async function handleSave() {
    try {
      const hours = calculateHours(rowData);
      timesheet.total_reg_hours = hours.totalRegHours;
      timesheet.total_overtime = hours.totalOvertime;
      timesheet.submitted_by = timesheet.signed
        ? localStorage.getItem("user_name")
        : "None";
      timesheet.employee_id = localStorage.getItem("userId");
      timesheet.week_ending = selectedDate;
      timesheet.id = timesheetId || timesheet.id;

      const timesheetRequestBody = {
        timesheetData: timesheet,
        timesheetEntryData: rowData,
      };

      const res = await saveTimesheet(timesheetRequestBody, timesheetId);

      if (res.internalStatus === "success" && res.data) {
        if (!timesheetId) {
          // Only navigate if it was a new creation
          const createdTimesheetId = res.data.timesheet.id;
          navigate(
            `/employee-portal/dashboard/timesheets/${createdTimesheetId}`
          );
          timesheetCtx.triggerUpdate(); // Only trigger update after creating new
        }

        // Update local data if editing
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
      ...prevTimesheet, // Keep all other fields unchanged
      signed: !prevTimesheet.signed, // Toggle the signed field
    }));
  }

  function handleAddRow() {
    setRowData((prevData) => [
      ...prevData,
      {
        ...intitialEntriesData[0], // Use the first entry as the base template
        row_index: prevData.length + 1, // Update only the index
      },
    ]);
  }

  async function handleDeleteRow(index, row) {
    // If the row has an ID, delete it from the server
    if (row.id) {
      try {
        await deleteTimesheetEntryById(index, row);
      } catch (error) {
        console.error("Error deleting row from the server: ", error);
        return;
      }
    }

    // Remove the row locally
    setRowData((prevData) => prevData.filter((_, i) => i !== index));
  }

  function handleValueChange(index, field, value) {
    setRowData((prevData) =>
      prevData.map((row, i) => {
        if (i === index) {
          const updatedRow = { ...row, [field]: value };
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
  return (
    <div className="pb-20">
      <div className="relative flex gap-5 justify-between px-2 md:px-5 pb-10 ">
        <DatePickerComponent
          onChange={(date) => setSelectedDate(date)}
          selected={formatWeekendDate(selectedDate)}
          disabled={timesheet.approved}
        />
        <FormActionsButtons
          handleSave={handleSave}
          handleSign={handleSign}
          signed={timesheet.signed}
          disabled={timesheet.approved}
          href={"/employee-portal/dashboard/timesheets/create-timesheet"}
        />{" "}
      </div>
      <FormTable
        data={rowData}
        onValueChange={handleValueChange}
        onDeleteRow={handleDeleteRow}
        timesheetId={timesheetId}
        disabled={timesheet.approved}
        // onAddDescription={handleShowModal} // Pass row index to the modal handler
      />
      <div
        className={`flex ${
          timesheet.approved ? "justify-end my-5" : "justify-between"
        } gap-5 items-center px-3 md:px-5`}
      >
        {timesheet.approved ? (
          <> </>
        ) : (
          <div className="">
            <AddEntryButton onClick={handleAddRow} />
          </div>
        )}
        <div className="flex items-center justify-end gap-2">
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
