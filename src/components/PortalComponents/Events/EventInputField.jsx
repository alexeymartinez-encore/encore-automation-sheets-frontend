import "./event-input.css";
export default function EventInputField({
  label,
  value,
  type,
  onChange,
  placeholder,
  inputStyles = "",
}) {
  return (
    <div className="flex flex-col justify-center items-center gap-0 w-full py-1">
      <label className="py-2 text-xs text-blue-500">{label}</label>
      <input
        className={`text-black text-xs text-center border border-gray-300 rounded-md px-3 py-2 w-full
           focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none ${inputStyles}`}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
