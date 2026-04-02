import { useCallback, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import TaskBar from "./TaskBar";
import { getEndOfWeek } from "../../../../../util/helper";
import { AdminContext } from "../../../../../store/admin-context";
import { TimesheetContext } from "../../../../../store/timesheet-context";
import MissingSubmissionPanel from "../ManageSheetsShared/MissingSubmissionPanel";
import { AuthContext } from "../../../../../store/auth-context";
import { getAuthUserName } from "../../../../../util/authUser";
import LoadingState from "../../../Shared/LoadingState";
import ConfirmActionModal from "../../../Shared/ConfirmActionModal";
import useActionConfirmation from "../../../../../hooks/useActionConfirmation";

function buildWeekIsoDate(date) {
  const normalizedDate = new Date(date);
  const hours = Number(import.meta.env.VITE_UTC_CONFIGURATION ?? 4);
  normalizedDate.setUTCHours(hours, 0, 0, 0);
  return normalizedDate.toISOString();
}

function formatWeekLabel(date) {
  return `Week ending ${new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))}`;
}

export default function ManageTimesheetsTable({
  openReportModal,
  activeEmployeeCount = 0,
  refreshToken = 0,
}) {
  let weekDate;

  if (localStorage.getItem("week_date") === null) {
    weekDate = getEndOfWeek(new Date());
  } else {
    weekDate = getEndOfWeek(new Date(localStorage.getItem("week_date")));
  }

  const [timesheets, setTimesheets] = useState([]);
  const [selectedDate, setSelectedDate] = useState(weekDate);
  const [isToggled, setIsToggled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signedCount, setSignedCount] = useState(0);
  const [isMissingPanelOpen, setIsMissingPanelOpen] = useState(false);
  const [isMissingLoading, setIsMissingLoading] = useState(false);
  const [isSendingAllReminders, setIsSendingAllReminders] = useState(false);
  const [sendingReminderIds, setSendingReminderIds] = useState([]);
  const [missingSummary, setMissingSummary] = useState({
    missingEmployees: [],
    activeEmployeeCount,
    completedCount: 0,
  });

  const timesheetMode = !isToggled ? "Go to Open" : "Go to By Date";

  const adminCtx = useContext(AdminContext);
  const timesheetCtx = useContext(TimesheetContext);
  const authCtx = useContext(AuthContext);
  const currentUserName = getAuthUserName(authCtx.user) || "Unknown User";
  const {
    confirmationDialog,
    requestConfirmation,
    confirmConfirmation,
    cancelConfirmation,
  } = useActionConfirmation();

  const loadTimesheets = useCallback(async () => {
    setIsLoading(true);
    try {
      const isoDate = buildWeekIsoDate(selectedDate);
      const result = isToggled
        ? await adminCtx.getOpenTimesheets()
        : await adminCtx.getUsersTimesheetsByDate(isoDate);

      const sorted = (result || []).sort((a, b) => {
        const lastNameA = a.Employee?.last_name?.toLowerCase() || "";
        const lastNameB = b.Employee?.last_name?.toLowerCase() || "";
        return lastNameA.localeCompare(lastNameB);
      });

      setTimesheets(sorted || []);
      const count = (sorted || []).filter((timesheet) => timesheet.signed).length;
      setSignedCount(count);
    } finally {
      setIsLoading(false);
    }
  }, [adminCtx, isToggled, selectedDate]);

  useEffect(() => {
    loadTimesheets();
  }, [loadTimesheets, refreshToken]);

  const loadMissingSummary = useCallback(async () => {
    if (isToggled) return;

    setIsMissingLoading(true);
    const summary = await adminCtx.getMissingTimesheetsByDate(
      buildWeekIsoDate(selectedDate)
    );
    setMissingSummary({
      missingEmployees: summary?.missingEmployees || [],
      activeEmployeeCount:
        summary?.activeEmployeeCount ?? activeEmployeeCount ?? 0,
      completedCount: summary?.completedCount || 0,
    });
    setIsMissingLoading(false);
  }, [activeEmployeeCount, adminCtx, isToggled, selectedDate]);

  useEffect(() => {
    if (isMissingPanelOpen && !isToggled) {
      loadMissingSummary();
    }
  }, [isMissingPanelOpen, isToggled, loadMissingSummary]);

  function handleToggle() {
    setIsToggled((previousValue) => {
      const nextValue = !previousValue;
      if (nextValue) {
        setIsMissingPanelOpen(false);
      }
      return nextValue;
    });
  }

  async function handleToggleMissingPanel() {
    const nextOpen = !isMissingPanelOpen;
    setIsMissingPanelOpen(nextOpen);

    if (nextOpen) {
      await loadMissingSummary();
    }
  }

  function handleValueChange(index, field, value) {
    setTimesheets((prevTimesheets) => {
      const updatedTimesheets = [...prevTimesheets];
      const isChecked =
        value === "true" ? true : !updatedTimesheets[index][field];

      updatedTimesheets[index] = {
        ...updatedTimesheets[index],
        [field]: isChecked,
        ...(field === "signed" && isChecked && { submitted_by: currentUserName }),
        ...(field === "approved" && isChecked && { approved_by: currentUserName }),
        ...(field === "processed" && isChecked && { processed_by: currentUserName }),
      };

      return updatedTimesheets;
    });
  }

  function goToPreviousWeek() {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      const nextWeekDate = getEndOfWeek(newDate);
      localStorage.setItem("week_date", nextWeekDate);
      return nextWeekDate;
    });
  }

  function goToNextWeek() {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      const nextWeekDate = getEndOfWeek(newDate);
      localStorage.setItem("week_date", nextWeekDate);
      return nextWeekDate;
    });
  }

  async function handleSaveStatusChanges() {
    const res = await adminCtx.saveTimesheetsStatusChanges(timesheets);
    if (res.internalStatus === "success") {
      timesheetCtx.triggerUpdate();
    }
  }

  async function handleSaveStatusChangesWithConfirmation() {
    const shouldSave = await requestConfirmation({
      title: "Save Status Changes?",
      message:
        "This will apply the modified signed/approved/processed status values to these timesheets.",
      confirmLabel: "Save",
    });
    if (!shouldSave) return;

    await handleSaveStatusChanges();
  }

  async function handleSendReminder(employeeId) {
    setSendingReminderIds((currentIds) =>
      currentIds.includes(employeeId) ? currentIds : [...currentIds, employeeId]
    );

    await adminCtx.sendMissingTimesheetReminders({
      weekEnding: buildWeekIsoDate(selectedDate),
      employeeIds: [employeeId],
    });

    setSendingReminderIds((currentIds) =>
      currentIds.filter((currentId) => currentId !== employeeId)
    );
    await loadMissingSummary();
  }

  async function handleSendAllReminders() {
    setIsSendingAllReminders(true);
    await adminCtx.sendMissingTimesheetReminders({
      weekEnding: buildWeekIsoDate(selectedDate),
    });
    setIsSendingAllReminders(false);
    await loadMissingSummary();
  }

  function handleSetAllApproved() {
    setTimesheets((prevTimesheets) => {
      const allApproved = prevTimesheets.every(
        (timesheet) => timesheet.approved
      );

      return prevTimesheets.map((timesheet) => ({
        ...timesheet,
        approved: !allApproved,
        approved_by: !allApproved ? currentUserName : "",
      }));
    });
  }

  async function handleSetAllApprovedWithConfirmation() {
    const shouldProceed = await requestConfirmation({
      title: "Apply 'Set All Approved'?",
      message:
        "This will toggle the Approved status for all rows currently shown in the table.",
      confirmLabel: "Apply",
    });
    if (!shouldProceed) return;

    handleSetAllApproved();
  }

  function handleSetAllProcessed() {
    setTimesheets((prevTimesheets) => {
      const allProcessed = prevTimesheets.every(
        (timesheet) => timesheet.processed
      );

      return prevTimesheets.map((timesheet) => ({
        ...timesheet,
        processed: !allProcessed,
        processed_by: !allProcessed ? currentUserName : "",
      }));
    });
  }

  async function handleSetAllProcessedWithConfirmation() {
    const shouldProceed = await requestConfirmation({
      title: "Apply 'Set All Processed'?",
      message:
        "This will toggle the Processed status for all rows currently shown in the table.",
      confirmLabel: "Apply",
    });
    if (!shouldProceed) return;

    handleSetAllProcessed();
  }

  async function generateLaborReport() {
    const isoDate = buildWeekIsoDate(selectedDate);
    const resp = await adminCtx.fetchLaborData(isoDate);

    const escapeXml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const parseDateUTC = (ymd) => {
      if (!ymd) return new Date(NaN);
      if (typeof ymd === "string" && /^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        const [year, month, day] = ymd.split("-").map(Number);
        return new Date(Date.UTC(year, month - 1, day));
      }
      return new Date(ymd);
    };

    const formatDateForFile = (date) =>
      new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" })
        .format(date)
        .replace(" ", "");

    const endDate = new Date(selectedDate);
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - 13);
    const fileName = `EncoreLabor${formatDateForFile(
      startDate
    )}to${formatDateForFile(endDate)}_${startDate.getFullYear()}.xml`;

    const allRows = [];

    for (const ts of resp) {
      const weekEndingDate = parseDateUTC(ts.week_ending);
      const daysToSubtract = Number(import.meta.env.VITE_DAYS_REPORT ?? 6);

      const weekDates = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekEndingDate);
        date.setUTCDate(weekEndingDate.getUTCDate() - daysToSubtract + index);
        return date.toISOString().split("T")[0];
      });

      const employeeNumber = ts.employee_id ?? "";
      const employeeName =
        `${ts.Employee?.first_name ?? ""} ${ts.Employee?.last_name ?? ""}`.trim() ||
        "Unknown";

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

          allRows.push({
            LaborDate: weekDates[index],
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

    allRows.sort((first, second) => new Date(first.LaborDate) - new Date(second.LaborDate));

    let xmlContent = "<ProjectLabor>\n";
    allRows.forEach((row) => {
      xmlContent += `<row LaborDate="${row.LaborDate}T00:00:00" EmployeeNumber="${escapeXml(
        row.EmployeeNumber
      )}" EmployeeName="${escapeXml(row.EmployeeName)}" RegHours="${
        row.RegHours
      }" OTHours="${row.OTHours}" ProjectNumber="${escapeXml(
        row.ProjectNumber
      )}" Description="${escapeXml(row.Description)}" Phase="${escapeXml(
        row.Phase
      )}" CostCode="${escapeXml(row.CostCode)}" />\n`;
    });
    xmlContent += "</ProjectLabor>";

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
        openReportModal={openReportModal}
        saveChanges={handleSaveStatusChangesWithConfirmation}
        setAllApproved={handleSetAllApprovedWithConfirmation}
        setAllPaid={handleSetAllProcessedWithConfirmation}
        generateReport={generateLaborReport}
        handleToggle={handleToggle}
        timesheetMode={timesheetMode}
        isToggled={isToggled}
        completeTimesheets={signedCount}
        totalEmployeesCount={activeEmployeeCount}
        toggleMissingPanel={handleToggleMissingPanel}
        isMissingPanelOpen={isMissingPanelOpen}
        missingButtonDisabled={isToggled}
      />

      {isMissingPanelOpen ? (
        <div className="my-2">
          <MissingSubmissionPanel
            title="Missing Timesheets"
            periodLabel={formatWeekLabel(selectedDate)}
            missingEmployees={missingSummary.missingEmployees}
            activeEmployeeCount={
              missingSummary.activeEmployeeCount || activeEmployeeCount || 0
            }
            completedCount={missingSummary.completedCount}
            isLoading={isMissingLoading}
            isSendingAll={isSendingAllReminders}
            sendingEmployeeIds={sendingReminderIds}
            onRefresh={loadMissingSummary}
            onSendAll={handleSendAllReminders}
            onSendSingle={handleSendReminder}
            emptyMessage="Everyone active has submitted a signed timesheet for this week."
          />
        </div>
      ) : null}

      <TableHeader />
      <div className="bg-white my-1 rounded-md shadow-sm">
        {isLoading ? (
          <LoadingState
            label="Loading admin timesheets..."
            className="bg-transparent py-6"
          />
        ) : timesheets && timesheets.length > 0 ? (
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
      <ConfirmActionModal
        isOpen={confirmationDialog.isOpen}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        confirmLabel={confirmationDialog.confirmLabel}
        cancelLabel={confirmationDialog.cancelLabel}
        tone={confirmationDialog.tone}
        onConfirm={confirmConfirmation}
        onCancel={cancelConfirmation}
      />
    </div>
  );
}

ManageTimesheetsTable.propTypes = {
  openReportModal: PropTypes.func.isRequired,
  activeEmployeeCount: PropTypes.number,
  refreshToken: PropTypes.number,
};
