import DatePicker from "react-datepicker";

export default function MonthlyDatePicker({ onChange, selected, disabled }) {
  // Allow only the first day of the month
  const isFirstDayOfMonth = (date) => date.getDate() === 1;

  return (
    <div className="flex gap-5 items-baseline text-xs">
      <div className="flex gap-5 items-center justify-center bg-blue-500 px-3 py-1 rounded-md">
        <span className="text-white">Month Starting On:</span>
        <DatePicker
          selected={selected}
          onChange={onChange}
          className="border text-center rounded-md py-1"
          placeholderText="Select date"
          filterDate={isFirstDayOfMonth} // Allow only the first day
          dateFormat="dd MMMM yyyy" // Display as Month Year
          showMonthYearPicker // Optional: pick by month
          disabled={disabled}
        />
      </div>
    </div>
  );
}
