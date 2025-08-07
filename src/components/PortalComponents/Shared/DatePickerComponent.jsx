import DatePicker from "react-datepicker";

export default function DatePickerComponent({ onChange, selected, disabled }) {
  const isSunday = (date) => date.getDay() === 0;

  return (
    <div className="flex gap-5 items-baseline text-xs z-10">
      <div className="flex flex-col md:flex-row gap-1 items-center justify-center bg-blue-500 px-3 py-2 rounded-md">
        <span className="text-white md:text-sm text-[0.7rem]">
          Week Ending On:
        </span>
        <DatePicker
          selected={selected}
          onChange={onChange}
          className="border text-center rounded-md py-1 md:text-sm text-[0.7rem]"
          placeholderText="Select date"
          filterDate={isSunday} // Allow only Sundays
          disabled={disabled}
        />
      </div>
    </div>
  );
}
