import { useContext, useEffect, useState } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import TaskBar from "./TaskBar";
import { getEndOfWeek } from "../../../../../util/helper";
import { AdminContext } from "../../../../../store/admin-context";
import { TimesheetContext } from "../../../../../store/timesheet-context";

export default function ManageTimesheetsTable({ onViewOvertime }) {
  let weekDate;

  if (localStorage.getItem("week_date") === null) {
    weekDate = getEndOfWeek(new Date());
  } else {
    weekDate = getEndOfWeek(new Date(localStorage.getItem("week_date")));
  }
  const [timesheets, setTimesheets] = useState([]);
  const [selectedDate, setSelectedDate] = useState(weekDate);
  const [isToggled, setIsToggled] = useState(false);
  const [signedCount, setSignedCount] = useState(0);

  const timesheetMode = !isToggled ? "Open Timesheets" : "Timesheets By Date";

  const adminCtx = useContext(AdminContext);
  const timesheetCtx = useContext(TimesheetContext);

  useEffect(() => {
    async function getTimesheets() {
      // Convert to ISO 8601. Always set to 4:00

      const date = new Date(selectedDate);
      const hours = import.meta.env.VITE_UTC_CONFIGURATION;
      // Force to 4:00 AM UTC
      date.setUTCHours(hours, 0, 0, 0);

      const isoDate = date.toISOString();
      const res = await adminCtx.getUsersTimesheetsByDate(isoDate);

      const sorted = (res || []).sort((a, b) => {
        const lastNameA = a.Employee?.last_name?.toLowerCase() || "";
        const lastNameB = b.Employee?.last_name?.toLowerCase() || "";
        return lastNameA.localeCompare(lastNameB);
      });
      setTimesheets(sorted || []);
      const count = (sorted || []).filter((ts) => ts.signed === true).length;
      setSignedCount(count);
    }
    getTimesheets();
  }, [selectedDate]);

  async function handleToggle() {
    const newState = !isToggled; // use current state
    setIsToggled(newState);

    const isoDate = new Date(selectedDate).toISOString();

    let res;
    if (newState) {
      // Going to Open Expenses
      res = await adminCtx.getOpenTimesheets();
    } else {
      // Going back to Expenses By Date
      res = await adminCtx.getUsersTimesheetsByDate(isoDate);
    }

    const sorted = (res || []).sort((a, b) => {
      const lastNameA = a.Employee?.last_name?.toLowerCase() || "";
      const lastNameB = b.Employee?.last_name?.toLowerCase() || "";
      return lastNameA.localeCompare(lastNameB);
    });

    setTimesheets(sorted || []);
    const count = (sorted || []).filter((ts) => ts.signed === true).length;
    setSignedCount(count);
  }

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
      const weekDate = getEndOfWeek(newDate);
      localStorage.setItem("week_date", weekDate);
      return weekDate;
      // return newDate;
    });
  }

  function goToNextWeek() {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      const weekDate = getEndOfWeek(newDate);
      localStorage.setItem("week_date", weekDate);
      return weekDate;
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
    // --- inputs & fetch ---
    const date = new Date(selectedDate);
    const hours = Number(import.meta.env.VITE_UTC_CONFIGURATION ?? 4); // fallback to 4 if unset
    date.setUTCHours(hours, 0, 0, 0);
    const isoDate = date.toISOString();

    const resp = await adminCtx.fetchLaborData(isoDate);

    // --- helpers ---
    const escapeXml = (s) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    // Parse "YYYY-MM-DD" as a UTC date
    const parseDateUTC = (ymd) => {
      if (!ymd) return new Date(NaN);
      if (typeof ymd === "string" && /^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        const [y, m, d] = ymd.split("-").map(Number);
        return new Date(Date.UTC(y, m - 1, d));
      }
      return new Date(ymd);
    };

    const formatDateForFile = (d) =>
      new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" })
        .format(d)
        .replace(" ", "");

    // file name from biweekly range (selectedDate back 13 days)
    const endDate = new Date(selectedDate);
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - 13);
    const fileName = `EncoreLabor${formatDateForFile(
      startDate
    )}to${formatDateForFile(endDate)}_${startDate.getFullYear()}.xml`;

    // Collect rows here
    const allRows = [];

    for (const ts of resp) {
      const weekEndingDate = parseDateUTC(ts.week_ending);
      const daysToSubstract = import.meta.env.VITE_DAYS_REPORT;

      const weekDates = Array.from({ length: 7 }, (_, index) => {
        const d = new Date(weekEndingDate);
        d.setUTCDate(weekEndingDate.getUTCDate() - daysToSubstract + index);
        return d.toISOString().split("T")[0];
      });

      const employeeNumber = ts.employee_id ?? "";
      const employeeName =
        `${ts.Employee?.first_name ?? ""} ${
          ts.Employee?.last_name ?? ""
        }`.trim() || "Unknown";

      const entries = Array.isArray(ts.TimesheetEntries)
        ? ts.TimesheetEntries
        : [];

      for (const entry of entries) {
        const dayKeys = [
          { day: "mon", index: 0 },
          { day: "tue", index: 1 },
          { day: "wed", index: 2 },
          { day: "thu", index: 3 },
          { day: "fri", index: 4 },
          { day: "sat", index: 5 },
          { day: "sun", index: 6 },
        ];

        const projectNumber = entry.Project?.number ?? "";
        const description =
          (entry.Project?.description ?? entry.description ?? "None").trim() ||
          "None";
        const phase = entry.Phase?.number ?? "0";
        const costCode = entry.CostCode?.cost_code ?? "0";

        for (const { day, index } of dayKeys) {
          const reg = Number(entry[`${day}_reg`] ?? 0);
          const ot = Number(entry[`${day}_ot`] ?? 0);
          if (reg === 0 && ot === 0) continue;

          const laborDate = weekDates[index];

          allRows.push({
            LaborDate: laborDate,
            EmployeeNumber: employeeNumber,
            EmployeeName: employeeName,
            RegHours: reg.toFixed(15),
            OTHours: ot.toFixed(15),
            ProjectNumber: projectNumber,
            Description: description,
            Phase: phase,
            CostCode: costCode,
          });
        }
      }
    }

    // 🟢 Sort rows by date
    allRows.sort((a, b) => new Date(a.LaborDate) - new Date(b.LaborDate));

    // 🟢 Build XML after sorting
    let xmlContent = "<ProjectLabor>\n";
    allRows.forEach((row) => {
      xmlContent += `  <row
    LaborDate="${row.LaborDate}T00:00:00"
    EmployeeNumber="${escapeXml(row.EmployeeNumber)}"
    EmployeeName="${escapeXml(row.EmployeeName)}"
    RegHours="${row.RegHours}"
    OTHours="${row.OTHours}"
    ProjectNumber="${escapeXml(row.ProjectNumber)}"
    Description="${escapeXml(row.Description)}"
    Phase="${escapeXml(row.Phase)}"
    CostCode="${escapeXml(row.CostCode)}"
  />\n`;
    });
    xmlContent += "</ProjectLabor>";

    // --- download file ---
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col text-center w-full">
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
        handleToggle={handleToggle}
        timesheetMode={timesheetMode}
        isToggled={isToggled}
        totalTimesheets={timesheets.length}
        completeTimesheets={signedCount}
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
