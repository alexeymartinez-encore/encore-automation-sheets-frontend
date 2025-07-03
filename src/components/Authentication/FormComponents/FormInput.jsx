export default function FormInput({ type, placeholder, value, onChange }) {
  return (
    <input
      className="border border-blue-100 h-10 w-[20rem] my-2 text-center rounded-md"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
    />
  );
}
