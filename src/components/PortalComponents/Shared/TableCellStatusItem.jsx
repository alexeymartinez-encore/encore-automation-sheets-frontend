export default function TableCellStatusItem({ status, mobileStyle }) {
  return (
    <p
      className={`flex-1 text-center text-[0.5rem] md:text-sm ${
        status ? "text-green-600" : "text-red-600"
      } ${mobileStyle}`}
    >
      {status ? "Yes" : "No"}
    </p>
  );
}
