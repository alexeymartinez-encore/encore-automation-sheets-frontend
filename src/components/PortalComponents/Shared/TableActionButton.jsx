export default function TableActionButton({
  onClick,
  children,
  color,
  disabled,
}) {
  const style = color === "red" ? `` : ``;
  return (
    <button
      onClick={onClick}
      className={`text-center px-1 md:px-2 py-1 text-white text-[0.5rem] md:text-xs rounded-sm transition duration-300 ${style}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
