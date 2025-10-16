export default function FormInput({
  type,
  placeholder,
  value,
  onChange,
  label,
}) {
  return (
    <div className="flex justify-between items-center md:flex-col w-full">
      <label className="text-start md:text-center text-blue-500 w-2/3 ">
        {label}
      </label>

      <input
        className="border border-blue-100 h-10 md:w-full my-2 text-center rounded-md "
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
}
