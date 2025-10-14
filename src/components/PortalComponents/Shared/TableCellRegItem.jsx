export default function TableCellRegItem({ children, mobileStyle }) {
  return (
    <p
      className={`flex-1 text-center  ${
        mobileStyle ? `${mobileStyle} md:text-sm` : " md:text-sm"
      }`}
    >
      {children}
    </p>
  );
}
