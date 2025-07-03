export default function OuterCard({ children, padding }) {
  return (
    <div className={`flex flex-col items-center ${padding} text-white`}>
      {children}
    </div>
  );
}
