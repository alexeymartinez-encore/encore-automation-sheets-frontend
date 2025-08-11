import { addDays, startOfMonth } from "date-fns";

// Function to calculate the end of the current week (Sunday)

// export function getEndOfWeek(date) {
//   const currentDay = date.getDay();
//   const daysUntilEndOfWeek = 7 - currentDay; // Days until Sunday
//   console.log(addDays(date, daysUntilEndOfWeek));
//   return addDays(date, daysUntilEndOfWeek);
// }

export function getEndOfWeek(date) {
  const d = new Date(date);
  const currentDay = d.getDay(); // 0=Sun ... 6=Sat
  const daysUntilEnd = (7 - currentDay) % 7; // 0 on Sunday, 6 on Monday, etc.
  d.setHours(0, 0, 0, 0); // normalize to local midnight
  d.setDate(d.getDate() + daysUntilEnd);
  return d; // local time end-of-week (Sunday 00:00 local)
}

export function getStartOfMonth(date) {
  // Ensure the provided `date` is a valid JavaScript Date object
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error("Invalid date object provided");
  }

  // Get the start of the month
  return startOfMonth(date);
}

export function calculateHours(rowData) {
  // Calculate total hours across all rows
  let totalHours = 0;

  rowData.forEach((row) => {
    const regHours =
      Number(row.mon_reg || 0) +
      Number(row.tue_reg || 0) +
      Number(row.wed_reg || 0) +
      Number(row.thu_reg || 0) +
      Number(row.fri_reg || 0) +
      Number(row.sat_reg || 0) +
      Number(row.sun_reg || 0);

    // Accumulate the total hours
    totalHours += regHours;
  });

  // Apply the max regular hours logic (max 40 regular hours, excess as overtime)
  const totalOvertime = totalHours > 40 ? totalHours - 40 : 0;
  const totalRegHours = Math.min(totalHours, 40);
  return { totalOvertime, totalRegHours };
}

export function getDaysInMonth(date) {
  const year = date.getFullYear(); // Get the year from the date
  const month = date.getMonth(); // Get the month from the date (0-indexed)

  // Create a new Date for the next month and set the day to 0
  // This gives the last day of the current month
  return new Date(year, month + 1, 0).getDate();
}

export function calculateColumnTotals(data) {
  return data.reduce(
    (totals, row) => {
      totals.destination_cost += Number(row.destination_cost || 0);
      totals.lodging_cost += Number(row.lodging_cost || 0);
      totals.other_expense_cost += Number(row.other_expense_cost || 0);
      totals.car_rental_cost += Number(row.car_rental_cost || 0);
      totals.miles_cost += Number(row.miles_cost || 0);
      totals.perdiem_cost += Number(row.perdiem_cost || 0);
      totals.entertainment_cost += Number(row.entertainment_cost || 0);
      totals.miscellaneous_amount += Number(row.miscellaneous_amount || 0);
      totals.grand_total +=
        Number(row.destination_cost || 0) +
        Number(row.lodging_cost || 0) +
        Number(row.other_expense_cost || 0) +
        Number(row.car_rental_cost || 0) +
        Number(row.miles_cost || 0) +
        Number(row.perdiem_cost || 0) +
        Number(row.entertainment_cost || 0) +
        Number(row.miscellaneous_amount || 0);
      return totals;
    },
    {
      destination_cost: 0,
      lodging_cost: 0,
      other_expense_cost: 0,
      car_rental_cost: 0,
      miles_cost: 0,
      perdiem_cost: 0,
      entertainment_cost: 0,
      miscellaneous_amount: 0,
      grand_total: 0,
    }
  );
}

export function formatWeekendDate(date) {
  const weekEnding = new Date(date); // Parse the date

  const daysToSunday = (7 - weekEnding.getDay()) % 7; // Days remaining to reach Sunday

  // Add the calculated days to move to Sunday
  weekEnding.setDate(weekEnding.getDate() + daysToSunday);

  // Format the updated date to "MM/DD/YYYY"
  const formattedWeekEndingDate = weekEnding.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  return formattedWeekEndingDate;
}

export function formatMonthDate(date) {
  const monthStarting = new Date(date);

  const nextMonthStart = new Date(
    monthStarting.getFullYear(),
    monthStarting.getMonth() + 1, // Move to the next month
    1 // First day of the month
  );

  const formattedMonthStartingDate = nextMonthStart.toLocaleDateString(
    "en-US",
    {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }
  );

  return formattedMonthStartingDate;
}

// Format the selectedDate for display (e.g., MM/DD/YYYY)
export function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
