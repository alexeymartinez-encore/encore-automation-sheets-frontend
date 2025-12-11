import { getEndOfWeek } from "./helper";

export function getTimesheetTotalHours(timesheet) {
  if (!timesheet) return 0;
  const reg = Number(timesheet.total_reg_hours || 0);
  const ot = Number(timesheet.total_overtime || 0);
  return reg + ot;
}

export function getTimesheetStatus(timesheet) {
  if (!timesheet) {
    return { label: "Draft", tone: "gray", signed: false, approved: false, processed: false };
  }

  const signed = Boolean(timesheet.signed);
  const approved = Boolean(timesheet.approved);
  const processed = Boolean(timesheet.processed);

  if (processed) {
    return { label: "Processed", tone: "emerald", signed, approved, processed };
  }

  if (approved) {
    return { label: "Approved", tone: "blue", signed, approved, processed };
  }

  if (signed) {
    return { label: "Awaiting approval", tone: "amber", signed, approved, processed };
  }

  return { label: "Draft", tone: "gray", signed, approved, processed };
}

export function getTimesheetLifecycle(timesheet) {
  const status = getTimesheetStatus(timesheet);

  return [
    { label: "Signed", active: status.signed },
    { label: "Approved", active: status.approved },
    { label: "Processed", active: status.processed },
  ];
}

export function buildTimesheetInsights(timesheets = []) {
  const sorted = [...timesheets].sort((a, b) => {
    const da = a?.week_ending ? new Date(a.week_ending).getTime() : 0;
    const db = b?.week_ending ? new Date(b.week_ending).getTime() : 0;
    return db - da;
  });

  const totalHours = sorted.reduce(
    (sum, sheet) => sum + getTimesheetTotalHours(sheet),
    0
  );

  const pending = sorted.filter((sheet) => !sheet.approved).length;
  const awaitingSignature = sorted.filter((sheet) => !sheet.signed).length;
  const processed = sorted.filter((sheet) => sheet.processed).length;
  const submitted = sorted.length;
  const avgWeekly =
    submitted > 0 ? Math.round(totalHours / submitted) : 0;

  return {
    totalHours,
    pending,
    awaitingSignature,
    processed,
    submitted,
    avgWeekly,
    nextDue: getEndOfWeek(new Date()),
    lastSubmitted: sorted[0] || null,
  };
}
