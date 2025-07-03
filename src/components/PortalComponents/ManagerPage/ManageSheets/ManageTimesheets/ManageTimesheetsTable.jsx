import { useContext, useEffect, useState } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import TaskBar from "./TaskBar";
import { getEndOfWeek } from "../../../../../util/helper";
import { AdminContext } from "../../../../../store/admin-context";
import { TimesheetContext } from "../../../../../store/timesheet-context";

export default function ManageTimesheetsTable({ onViewOvertime }) {
  const [timesheets, setTimesheets] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getEndOfWeek(new Date()));

  const adminCtx = useContext(AdminContext);
  const timesheetCtx = useContext(TimesheetContext);

  useEffect(() => {
    async function getTimesheets() {
      // console.log(selectedDate);
      const res = await adminCtx.getUsersTimesheetsByDate(selectedDate);

      const userId = localStorage.getItem("user_id"); // Fetch user_name from localStorage

      // Filter timesheets where manager_id matches userId
      const filtered = (res || []).filter((ts) => ts.manager_id !== userId);
      // console.log(filtered);
      setTimesheets(filtered || []);
    }
    getTimesheets();
  }, [selectedDate]);

  function handleValueChange(index, field, value) {
    const userName = localStorage.getItem("user_name"); // Fetch user_name from localStorage

    setTimesheets((prevTimesheets) => {
      const updatedTimesheets = [...prevTimesheets];
      const isChecked =
        value === "true" ? true : !updatedTimesheets[index][field];

      updatedTimesheets[index] = {
        ...updatedTimesheets[index],
        [field]: isChecked, // Update the checkbox field
        ...(field === "signed" && isChecked && { submitted_by: userName }),
        ...(field === "approved" && isChecked && { approved_by: userName }),
        ...(field === "processed" && isChecked && { processed_by: userName }),
      };

      return updatedTimesheets;
    });
  }

  function goToPreviousWeek() {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }

  function goToNextWeek() {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }

  async function handleSaveStatusChanges() {
    const res = await adminCtx.saveTimesheetsStatusChanges(timesheets);
    if (res.internalStatus === "success") {
      timesheetCtx.triggerUpdate();
    }
  }

  function handleSetAllApproved() {
    const userName = localStorage.getItem("user_name") || "Unknown User";

    setTimesheets((prevTimesheets) => {
      const allApproved = prevTimesheets.every(
        (timesheet) => timesheet.approved
      );

      return prevTimesheets.map((timesheet) => ({
        ...timesheet,
        approved: !allApproved, // Toggle the approved state
        approved_by: !allApproved ? userName : "", // Set approved_by only if approving
      }));
    });
  }

  function handleSetAllProcessed() {
    const userName = localStorage.getItem("user_name") || "Unknown User";

    setTimesheets((prevTimesheets) => {
      const allProcessed = prevTimesheets.every(
        (timesheet) => timesheet.processed
      );

      return prevTimesheets.map((timesheet) => ({
        ...timesheet,
        processed: !allProcessed, // Toggle the processed state
        processed_by: !allProcessed ? userName : "", // Set processed_by only if processing
      }));
    });
  }

  async function generateLaborReport() {
    // Fetch the timesheets and entries from the API
    const newTimesheets = await adminCtx.fetchLaborData(selectedDate);
    console.log(newTimesheets);

    // XML Header
    let xmlContent = "<ProjectLabor>\n";

    // Function to format dates as "MonthDay" (e.g., "Feb24")
    const formatDate = (date) => {
      const options = { month: "short", day: "2-digit" };
      return new Intl.DateTimeFormat("en-US", options)
        .format(date)
        .replace(" ", "");
    };

    // Generate the file name based on the date range
    const endDate = new Date(selectedDate);
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - 13); // Go back 13 days for biweekly period

    const fileName = `EncoreLabor${formatDate(startDate)}to${formatDate(
      endDate
    )}_${startDate.getFullYear()}.xml`;

    // Iterate through each timesheet object
    newTimesheets.forEach(({ timesheet, entries }) => {
      // Calculate dates for each day of the week
      const weekEndingDate = new Date(timesheet.week_ending);
      const weekDates = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekEndingDate);
        date.setDate(weekEndingDate.getDate() - (5 - index));
        return date.toISOString().split("T")[0];
      });

      // Iterate through each entry for this timesheet
      entries.forEach((entry) => {
        // Map of day keys to simplify the iteration
        const dayKeys = [
          { day: "mon", index: 0 },
          { day: "tue", index: 1 },
          { day: "wed", index: 2 },
          { day: "thu", index: 3 },
          { day: "fri", index: 4 },
          { day: "sat", index: 5 },
          { day: "sun", index: 6 },
        ];

        dayKeys.forEach(({ day, index }) => {
          const regHours = Number(entry[`${day}_reg`] || 0).toFixed(15);
          const otHours = Number(entry[`${day}_ot`] || 0).toFixed(15);

          // Skip if both regular and overtime hours are zero
          if (regHours == 0 && otHours == 0) return;

          const laborDate = weekDates[index];
          const employeeNumber = timesheet.employee_id;
          const employeeName =
            `${timesheet.employee_first_name} ${timesheet.employee_last_name}` ||
            "Unknown";
          const projectNumber = entry.project || "";
          const description = entry.project_description || "None";
          const phase = entry.phase || "";
          const costCode = entry.cost_code || "";

          // Append the row to XML content
          xmlContent += `  <row
        LaborDate="${laborDate}T00:00:00"
        EmployeeNumber="${employeeNumber}"
        EmployeeName="${employeeName}"
        RegHours="${regHours}"
        OTHours="${otHours}"
        ProjectNumber="${projectNumber}"
        Description="${description}"
        Phase="${phase}"
        CostCode="${costCode}"
      />\n`;
        });
      });
    });

    // Close the XML tag
    xmlContent += "</ProjectLabor>";

    // Create a Blob from the XML data
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    // Cleanup
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col w-full">
      <TaskBar
        onChange={(date) => setSelectedDate(date)}
        selectedDate={selectedDate}
        goToPreviousWeek={goToPreviousWeek}
        goToNextWeek={goToNextWeek}
        viewOvertime={onViewOvertime}
        saveChanges={handleSaveStatusChanges}
        setAllApproved={handleSetAllApproved}
        setAllPaid={handleSetAllProcessed}
        generateReport={generateLaborReport}
      />
      <TableHeader />
      <div className="bg-white my-1 rounded-md shadow-sm">
        {timesheets && timesheets.length > 0 ? (
          timesheets.map((timesheet, index) => (
            <TableRow
              key={timesheet.id}
              timesheet={timesheet}
              index={index}
              onValueChange={handleValueChange}
            />
          ))
        ) : (
          <p className="bg-white text-blue-900 text-center py-3 text-xs">
            No timesheets found for this date range
          </p>
        )}
      </div>
    </div>
  );
}
