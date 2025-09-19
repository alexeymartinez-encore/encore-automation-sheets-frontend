import DatePicker from "react-datepicker";
import { useContext, useEffect, useState } from "react";
import { getEndOfWeek } from "../../../../../util/helper";
import DateNavigationBtns from "../ManageSheetsShared/DateNavigationBtns";
import { AdminContext } from "../../../../../store/admin-context";

export default function VacationReportModal({ onClose }) {
  const [timesheets, setTimesheets] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getEndOfWeek(new Date()));
  const isSunday = (date) => date.getDay() === 0;
  const adminCtx = useContext(AdminContext);

  function groupByEmployee(timesheets) {
    const map = new Map();

    timesheets.forEach((person) => {
      const empId = person.Employee.id;
      const workedHours = getWorkedHours(person);

      if (map.has(empId)) {
        map.get(empId).hours += workedHours;
      } else {
        map.set(empId, {
          id: empId,
          firstName: person.Employee.first_name,
          lastName: person.Employee.last_name,
          hours: workedHours,
        });
      }
    });

    return Array.from(map.values());
  }

  useEffect(() => {
    async function getTimesheets() {
      const res = await adminCtx.fetchVacationData(selectedDate);
      setTimesheets(res || []);
    }
    getTimesheets();
  }, [selectedDate, adminCtx]);

  function getWorkedHours(person) {
    if (!person.TimesheetEntries) return 0;

    return person.TimesheetEntries.reduce((sum, entry) => {
      return (
        sum +
        entry.mon_reg +
        entry.mon_ot +
        entry.tue_reg +
        entry.tue_ot +
        entry.wed_reg +
        entry.wed_ot +
        entry.thu_reg +
        entry.thu_ot +
        entry.fri_reg +
        entry.fri_ot +
        entry.sat_reg +
        entry.sat_ot +
        entry.sun_reg +
        entry.sun_ot
      );
    }, 0);
  }

  const groupedTimesheets = groupByEmployee(timesheets);

  const totalVacation = groupedTimesheets.reduce(
    (sum, emp) => sum + emp.hours,
    0
  );

  function downloadCSV() {
    const headers = ["Last Name", "First Name", "Total Hours"];

    const grouped = groupByEmployee(timesheets);

    const rows = grouped.map((emp) => [emp.lastName, emp.firstName, emp.hours]);

    const totalHours = grouped.reduce((sum, emp) => sum + emp.hours, 0);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
      `Total Hours,,${totalHours}`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vacation_report_${
      selectedDate.toISOString().split("T")[0]
    }.csv`;
    link.click();
    URL.revokeObjectURL(url);
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

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center justify-start bg-white w-[30rem] rounded-md p-10 shadow-sm md:h-[40rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center w-full">
          <h1 className="py-3 text-lg">Bi-Weekly Vacation Report</h1>
          <button
            onClick={downloadCSV}
            className="bg-blue-500 text-white py-1 px-5 text-sm rounded-md hover:bg-blue-400 transition duration-400"
          >
            Download .csv
          </button>
        </div>

        <div className="flex justify-between items-center gap-10 my-5">
          <div className="flex items-center">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="border text-center rounded-md py-1 text-xs"
              placeholderText="Select date"
              filterDate={isSunday}
            />
          </div>
          <DateNavigationBtns
            goToNext={goToNextWeek}
            goToPrevious={goToPreviousWeek}
            date={selectedDate}
          />
        </div>

        <div className="overflow-y-auto max-h-[30rem] border w-full">
          <table className="mx-10 text-xs w-full">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="grid grid-cols-3 gap-10 text-blue-900 p-2 text-center">
                <th>Last Name</th>
                <th>First Name</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {groupedTimesheets.map((emp) => (
                <tr
                  key={emp.id}
                  className="grid grid-cols-3 gap-10 px-2 mb-2 text-center "
                >
                  <td>{emp.lastName}</td>
                  <td>{emp.firstName}</td>
                  <td>{emp.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h1 className="text-xs self-end my-5">Total: {totalVacation}</h1>
      </div>
    </div>
  );
}
