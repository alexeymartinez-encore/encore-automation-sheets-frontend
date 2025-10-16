export default function OuterCard({ children, padding }) {
  return (
    <div
      className={`flex flex-row items-center justify-between ${padding} text-white`}
    >
      {children}
    </div>
  );
}
