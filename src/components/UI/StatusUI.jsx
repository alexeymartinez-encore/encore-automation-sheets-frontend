export default function StatusUI({ children, status }) {
  return (
    <p
      className={`pb-5 text-xl ${
        status === "error" ? "text-red-500" : "text-blue-500"
      } `}
    >
      {children}
    </p>
  );
}
