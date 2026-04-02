import { toDateOnly } from "./dateOnly.js";

const MS_IN_DAY = 1000 * 60 * 60 * 24;

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function parseDateOnly(value) {
  const dateOnly = toDateOnly(value);
  if (!dateOnly) return null;
  const [year, month, day] = dateOnly.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function addDays(date, days) {
  const nextDate = startOfDay(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1, 0, 0, 0, 0);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 0, 0, 0, 0);
}

function getWeekEnding(date) {
  const normalizedDate = startOfDay(date);
  const daysUntilSunday = (7 - normalizedDate.getDay()) % 7;
  return addDays(normalizedDate, daysUntilSunday);
}

function formatDate(date) {
  return DATE_FORMATTER.format(date);
}

function formatDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDaysUntilDue(dueDate, now) {
  const today = startOfDay(now);
  const normalizedDueDate = startOfDay(dueDate);
  return Math.round((normalizedDueDate.getTime() - today.getTime()) / MS_IN_DAY);
}

function getUrgency(daysUntilDue, type) {
  if (type === "timesheet") {
    if (daysUntilDue <= 1) return "red";
    if (daysUntilDue <= 3) return "orange";
    return "blue";
  }

  if (daysUntilDue <= 2) return "red";
  if (daysUntilDue <= 7) return "orange";
  return "blue";
}

function getActivityTime(record) {
  const activityDate =
    record?.updatedAt || record?.updated_at || record?.createdAt || record?.created_at;
  const timestamp = activityDate ? new Date(activityDate).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function buildPeriodLookup(records, getPeriodDate) {
  return records.reduce((lookup, record) => {
    const periodDate = getPeriodDate(record);
    if (!periodDate) {
      return lookup;
    }

    const key = formatDateOnly(periodDate);
    const activityTime = getActivityTime(record);
    const existing = lookup.get(key);

    if (!existing) {
      lookup.set(key, {
        key,
        periodDate,
        latestRecord: record,
        latestActivityTime: activityTime,
      });
      return lookup;
    }

    if (activityTime >= existing.latestActivityTime) {
      existing.latestRecord = record;
      existing.latestActivityTime = activityTime;
    }

    return lookup;
  }, new Map());
}

function buildMeta(overdue, daysUntilDue) {
  const prefix = "Not started.";
  if (overdue) {
    const overdueDays = Math.abs(daysUntilDue);
    return `${prefix} Overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}`;
  }

  if (daysUntilDue === 0) {
    return `${prefix} Due today`;
  }

  return `${prefix} Due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`;
}

function buildDeadlineItem({
  id,
  type,
  title,
  dueDate,
  detailType,
  now,
  recordId,
  createPath,
  createDate,
}) {
  const daysUntilDue = getDaysUntilDue(dueDate, now);
  const overdue = daysUntilDue < 0;

  return {
    id,
    type,
    title,
    meta: buildMeta(overdue, daysUntilDue),
    link: recordId
      ? detailType === "timesheet"
        ? `/employee-portal/dashboard/timesheets/details/${recordId}`
        : `/employee-portal/dashboard/expenses/details/${recordId}`
      : createPath,
    state: recordId ? undefined : { prefillDate: formatDateOnly(createDate) },
    dueDate,
    overdue,
    urgency: overdue ? "red" : getUrgency(daysUntilDue, detailType),
    daysUntilDue,
    daysPastDue: Math.abs(Math.min(daysUntilDue, 0)),
  };
}

function buildMissingTimesheetItem(weekEnding, now) {
  const weekStart = addDays(weekEnding, -6);
  if (startOfDay(now) < weekStart) {
    return null;
  }

  return buildDeadlineItem({
    id: `timesheet-missing-${formatDateOnly(weekEnding)}`,
    type: "Timesheet",
    title: `Week ending ${formatDate(weekEnding)}`,
    dueDate: weekEnding,
    detailType: "timesheet",
    now,
    createPath: "/employee-portal/dashboard/timesheets/create-timesheet",
    createDate: weekEnding,
  });
}

function buildMissingExpenseItem(monthStart, now) {
  if (startOfDay(now) < monthStart) {
    return null;
  }

  const dueDate = endOfMonth(monthStart);

  return buildDeadlineItem({
    id: `expense-missing-${formatDateOnly(monthStart)}`,
    type: "Expense",
    title: `Month starting ${formatDate(monthStart)}`,
    dueDate,
    detailType: "expense",
    now,
    createPath: "/employee-portal/dashboard/expenses/create-expense",
    createDate: monthStart,
  });
}

function sortOverdue(firstItem, secondItem) {
  if (secondItem.daysPastDue !== firstItem.daysPastDue) {
    return secondItem.daysPastDue - firstItem.daysPastDue;
  }

  return firstItem.dueDate - secondItem.dueDate;
}

function sortUpcoming(firstItem, secondItem) {
  if (firstItem.daysUntilDue !== secondItem.daysUntilDue) {
    return firstItem.daysUntilDue - secondItem.daysUntilDue;
  }

  return firstItem.dueDate - secondItem.dueDate;
}

function addMissingPeriodItem(items, lookupEntry, itemFactory) {
  if (lookupEntry?.latestRecord) {
    return;
  }

  const item = itemFactory();
  if (item) {
    items.push(item);
  }
}

export function getDeadlineUrgencyClasses(urgency) {
  if (urgency === "red") {
    return "border-red-300 bg-red-50 text-red-700";
  }

  if (urgency === "orange") {
    return "border-orange-300 bg-orange-50 text-orange-700";
  }

  return "border-blue-300 bg-blue-50 text-blue-700";
}

export function buildDashboardDeadlines({
  timesheets = [],
  expenses = [],
  now = new Date(),
}) {
  const currentDate = now instanceof Date ? now : new Date(now);
  const timesheetLookup = buildPeriodLookup(timesheets, (record) => {
    const parsedWeekEnding = parseDateOnly(record?.week_ending);
    return parsedWeekEnding ? getWeekEnding(parsedWeekEnding) : null;
  });
  const expenseLookup = buildPeriodLookup(expenses, (record) => {
    const parsedMonthDate = parseDateOnly(record?.date_start);
    return parsedMonthDate ? startOfMonth(parsedMonthDate) : null;
  });

  const items = [];

  const currentWeekEnding = getWeekEnding(currentDate);
  const previousWeekEnding = addDays(currentWeekEnding, -7);
  const currentMonthStart = startOfMonth(currentDate);
  const previousMonthStart = addMonths(currentMonthStart, -1);

  addMissingPeriodItem(
    items,
    timesheetLookup.get(formatDateOnly(previousWeekEnding)),
    () => buildMissingTimesheetItem(previousWeekEnding, currentDate)
  );
  addMissingPeriodItem(
    items,
    timesheetLookup.get(formatDateOnly(currentWeekEnding)),
    () => buildMissingTimesheetItem(currentWeekEnding, currentDate)
  );
  addMissingPeriodItem(
    items,
    expenseLookup.get(formatDateOnly(previousMonthStart)),
    () => buildMissingExpenseItem(previousMonthStart, currentDate)
  );
  addMissingPeriodItem(
    items,
    expenseLookup.get(formatDateOnly(currentMonthStart)),
    () => buildMissingExpenseItem(currentMonthStart, currentDate)
  );

  return {
    overdueItems: items.filter((item) => item.overdue).sort(sortOverdue),
    upcomingItems: items.filter((item) => !item.overdue).sort(sortUpcoming),
  };
}
