export default function FormContainerCard({ children }) {
  return (
    <div className="my-4 md:my-5 bg-white shadow-md rounded-lg overflow-hidden pt-6 md:pt-10 pb-5">
      {children}
    </div>
  );
}
