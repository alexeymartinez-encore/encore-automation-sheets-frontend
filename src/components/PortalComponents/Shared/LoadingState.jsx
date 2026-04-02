import PropTypes from "prop-types";

export default function LoadingState({ label = "Loading...", className = "" }) {
  return (
    <div
      className={`flex w-full items-center justify-center gap-3 rounded-md bg-white px-4 py-8 text-sm text-slate-600 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
      <span>{label}</span>
    </div>
  );
}

LoadingState.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
};
