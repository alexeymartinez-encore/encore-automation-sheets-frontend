export default function FormHoursTotal({ description, children, textColor }) {
  return (
    <div className="flex items-end justify-end bg-white text-end   text-xs">
      <h1 className="border py-2 pl-5 rounded-sm">
        {description}
        <span
          className={`bg-white text-black px-2 py-1 mx-2 rounded-sm ${textColor}`}
        >
          {children}
        </span>
      </h1>
    </div>
  );
}
