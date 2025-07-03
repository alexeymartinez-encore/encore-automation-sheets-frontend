export default function ButtonUI({ children, disabled, style, type, onClick }) {
  return (
    <button
      className={`bg-blue-500 text-white w-[20rem] h-10 rounded-md my-2 hover:bg-blue-400 transition duration-300 ${style}`}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
