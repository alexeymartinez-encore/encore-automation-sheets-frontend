import DatePicker from "react-datepicker";

export default function DatePickerComponent({ onChange, selected, disabled }) {
  const isSunday = (date) => date.getDay() === 0;
  const selectedDate =
    selected instanceof Date ? selected : selected ? new Date(selected) : null;

  return (
    <div className="w-full xl:w-auto xl:min-w-[18rem]">
      <div className="flex items-center gap-2 bg-blue-500 px-3 rounded-md w-full h-10">
        <span className="text-white text-xs sm:text-sm font-medium whitespace-nowrap shrink-0">
          Week Ending:
        </span>
        <DatePicker
          selected={selectedDate}
          onChange={onChange}
          className="w-full h-8 border border-blue-200 text-center rounded-md px-2 text-xs sm:text-sm text-slate-800"
          wrapperClassName="w-full"
          placeholderText="Select date"
          filterDate={isSunday}
          dateFormat="MM/dd/yyyy"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
