export default function TableContainerCard({ children }) {
  return (
    <div className="flex flex-row  gap-0 justify-between items-center md:p-3 p-3 md:border-b font-light">
      {children}
    </div>
  );
}
