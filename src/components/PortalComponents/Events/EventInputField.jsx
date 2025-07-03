export default function EventInputField({
  label,
  value,
  type,
  onChange,
  placeholder,
  inputStyles,
}) {
  return (
    <div className="flex flex-col justify-center items-center gap-0">
      <label className="py-2 text-blue-500">{label}</label>
      <input
        className={`text-black text-center border  ${inputStyles}`}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
