import { useContext, useMemo } from "react";
import { TimesheetContext } from "../store/timesheet-context";
import { ExpensesContext } from "../store/expense-context";
import { getEndOfWeek } from "../util/helper";

function asDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getTimesheetHours(timesheet) {
  const reg = Number(timesheet?.total_reg_hours ?? 0);
  const ot = Number(timesheet?.total_overtime ?? 0);
  return reg + ot;
}

function formatShortDate(date) {
  return date?.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function useDashboardAnalytics() {
  const { timesheets = [] } = useContext(TimesheetContext);
  const { expenses = [] } = useContext(ExpensesContext);

  return useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const sortedTimesheets = [...timesheets]
      .map((t) => ({ ...t, dateObj: asDate(t.week_ending) }))
      .filter((t) => t.dateObj)
      .sort((a, b) => b.dateObj - a.dateObj);

    const latestTimesheet = sortedTimesheets[0] ?? null;
    const latestTimesheetHours = latestTimesheet
      ? getTimesheetHours(latestTimesheet)
      : 0;

    const timesheetsThisYear = sortedTimesheets.filter(
      (t) => t.dateObj.getFullYear() === currentYear
    );

    const totalHoursYear = timesheetsThisYear.reduce(
      (sum, t) => sum + getTimesheetHours(t),
      0
    );

    const pendingTimesheets = sortedTimesheets.filter(
      (t) => !t.approved
    ).length;
    const unsignedTimesheets = sortedTimesheets.filter(
      (t) => !t.signed
    ).length;
    const outstandingTimesheets = sortedTimesheets.filter(
      (t) => !t.processed
    ).length;
    const approvedTimesheets = sortedTimesheets.length - pendingTimesheets;
    const signedTimesheets = sortedTimesheets.length - unsignedTimesheets;

    const weeklyTrend = sortedTimesheets
      .slice(0, 6)
      .reverse()
      .map((t) => ({
        label: formatShortDate(t.dateObj),
        value: getTimesheetHours(t),
      }));

    const expensesWithDates = expenses
      .map((expense) => ({
        ...expense,
        dateObj: asDate(expense.date_start || expense.created_at),
      }))
      .filter((e) => e.dateObj);

    const monthlyExpenses = expensesWithDates.filter((expense) => {
      return (
        expense.dateObj.getFullYear() === currentYear &&
        expense.dateObj.getMonth() === currentMonth
      );
    });

    const monthlyExpenseTotal = monthlyExpenses.reduce(
      (sum, expense) => sum + Number(expense.total ?? 0),
      0
    );

    const pendingExpenses = expensesWithDates.filter(
      (expense) => !expense.approved
    ).length;

    const latestExpense = expensesWithDates.sort(
      (a, b) => b.dateObj - a.dateObj
    )[0];

    const nextTimesheetDue = getEndOfWeek(now);

    return {
      totals: {
        totalHoursYear,
        latestTimesheetHours,
        pendingTimesheets,
        pendingExpenses,
        monthlyExpenseTotal,
      },
      latestTimesheet,
      latestExpense,
      weeklyTrend,
      monthlyExpenses,
      nextTimesheetDue,
    };
  }, [timesheets, expenses]);
}
