import DatePicker from "react-datepicker";
import { useContext, useEffect, useState } from "react";
import { getEndOfWeek } from "../../../../../util/helper";
import DateNavigationBtns from "../ManageSheetsShared/DateNavigationBtns";
import { AdminContext } from "../../../../../store/admin-context";

const PEOPLE = [
  {
    id: 1,
    lastName: "Martinez",
    firstName: "Alex",
    total: "4.0",
  },
  {
    id: 2,
    lastName: "Moore",
    firstName: "Cameron",
    total: "11.0",
  },
  {
    id: 3,
    lastName: "Bhagat",
    firstName: "Aeijaz",
    total: "7.0",
  },
  {
    id: 4,
    lastName: "Selk",
    firstName: "Randy",
    total: "2.0",
  },
];

export default function OvertimeModalComponent() {
  const [timesheets, setTimesheets] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getEndOfWeek(new Date()));
  const isSunday = (date) => date.getDay() === 0;
  const adminCtx = useContext(AdminContext);

  useEffect(() => {
    async function getTimesheets() {
      // console.log(selectedDate);
      const res = await adminCtx.fetchOvertimeData(selectedDate);
      setTimesheets(res || []);
    }
    getTimesheets();
  }, [selectedDate]);

  // Function to download the table data as a CSV file
  function downloadCSV() {
    // Create CSV content
    const headers = ["Last Name", "First Name", "Total Overtime"];
    const rows = timesheets.map((person) => [
      person.last_name,
      person.first_name,
      person.total_overtime,
    ]);

    // Calculate the total overtime from all timesheets
    const totalOvertime = timesheets.reduce(
      (sum, item) => sum + item.total_overtime,
      0
    );

    // Combine headers, rows, and total into a CSV string
    const csvContent = [
      headers.join(","), // Headers
      ...rows.map((row) => row.join(",")), // Individual rows
      `Total Overtime,,${totalOvertime}`, // Total overtime row
    ].join("\n");

    // Create a Blob from the CSV data
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Create a link to download the file
    const link = document.createElement("a");
    link.href = url;
    link.download = `overtime_report_${
      selectedDate.toISOString().split("T")[0]
    }.csv`;
    link.click();

    // Cleanup
    URL.revokeObjectURL(url);
  }

  const totalOvertime = timesheets.reduce(
    (sum, item) => sum + item.total_overtime,
    0
  );

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

  console.log(selectedDate);

  return (
    <div
      className=" flex flex-col items-center justify-center bg-white w-[30rem] rounded-md p-10 shadow-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center w-full">
        <h1 className="py-3 text-lg">Encore Overtime Report</h1>
        <button
          onClick={downloadCSV}
          className="bg-blue-500 text-white py-1 px-5 text-sm rounded-md hover:bg-blue-400 transition duration-400"
        >
          Download .csv
        </button>
      </div>
      <div className="flex justify-between items-center gap-10 my-5">
        <div className="flex items-center ">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            className="border text-center rounded-md py-1 text-xs"
            placeholderText="Select date"
            filterDate={isSunday} // Allow only Sundays
          />
        </div>
        <DateNavigationBtns
          goToNext={goToNextWeek}
          goToPrevious={goToPreviousWeek}
          date={selectedDate}
        />
      </div>
      <table className="w-full mx-10 text-xs border">
        {/* Header */}
        <thead>
          <tr className="flex justify-between gap-20 text-blue-900 p-2">
            <th className="">Last Name</th>
            <th>First Name</th>
            <th>Total</th>
          </tr>
        </thead>
        {/* Body */}
        <tbody>
          {timesheets.map((person) => (
            <tr
              key={person.id}
              className="flex justify-between gap-20 px-2 mb-2"
            >
              <td>{person.last_name}</td>
              <td>{person.first_name}</td>
              <td>{person.total_overtime}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h1 className="text-xs self-end my-5">Total: {totalOvertime}</h1>
    </div>
  );
}
