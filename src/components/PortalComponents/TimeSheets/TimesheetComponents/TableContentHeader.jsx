export default function TableContentHeader() {
  return (
    <div className="flex flex-row gap-0 justify-between p-3 border-b bg-blue-500 text-white rounded-md  md:text-sm items-center">
      <p className="flex-1 text-center">Date</p>
      <p className="hidden md:block flex-1 text-center">Signed</p>
      <p className="hidden md:block flex-1 text-center">Approved</p>
      <p className="hidden md:block flex-1 text-center">Processed</p>
      <p className="hidden md:block flex-1 text-center">Signed By</p>
      <p className="hidden md:block flex-1 text-center">Reg</p>
      <p className="hidden md:block flex-1 text-center">OT</p>
      <p className="flex-1 text-center">Total</p>
      <p className="flex-1 text-center md:my-0 my-1">-</p>
    </div>
  );
}
