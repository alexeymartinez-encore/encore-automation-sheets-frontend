export default function OuterCard({ children, padding }) {
  return (
    <div
      className={`self-stretch flex-1 h-full w-full flex flex-col items-center transition-all duration-300 ${padding} text-white`}
    >
      {children}
    </div>
  );
}
