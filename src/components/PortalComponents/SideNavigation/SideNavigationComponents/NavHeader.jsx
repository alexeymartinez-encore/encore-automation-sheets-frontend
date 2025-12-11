import PropTypes from "prop-types";
import { HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi2";

export default function NavHeader({
  isExpanded,
  onToggle,
  fullName,
  position,
}) {
  const initials = fullName
    ? fullName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "EP";

  return (
    <div className="px-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
          {isExpanded ? "Encore Portal" : "EP"}
        </p>
        <button
          type="button"
          onClick={onToggle}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          className="text-white/60 hover:text-white transition"
        >
          {isExpanded ? <HiChevronDoubleLeft /> : <HiChevronDoubleRight />}
        </button>
      </div>

      <div
        className={`flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-opacity ${
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none h-0"
        }`}
      >
        <div className="h-10 w-10 rounded-full bg-blue-400/40 text-white flex items-center justify-center font-semibold">
          {initials}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-medium text-white">
            {fullName || "Encore Team"}
          </p>
          <p className="text-xs text-white/60">{position || "Employee"}</p>
        </div>
      </div>
    </div>
  );
}

NavHeader.propTypes = {
  isExpanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  fullName: PropTypes.string,
  position: PropTypes.string,
};
