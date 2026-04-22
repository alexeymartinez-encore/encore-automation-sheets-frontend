import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { formatDate } from "../../../../../util/helper";

export default function DateNavigationBtns({
  goToPrevious,
  goToNext,
  date,
  handleState,
}) {
  return (
    <div className="flex min-w-0 items-center justify-center gap-2 sm:gap-3">
      <button
        onClick={goToPrevious}
        className={`shrink-0 px-1 md:px-2 py-1 text-white bg-blue-500 rounded-md
           hover:bg-blue-400 transition duration-300 ${
             handleState ? "cursor-not-allowed opacity-50" : ""
           }`}
        disabled={handleState}
      >
        <MdKeyboardArrowLeft className="md:size-5" />
      </button>

      <div className="min-w-[4.75rem] text-center text-[0.6rem] md:text-xs font-medium leading-tight text-gray-700 sm:min-w-[6.5rem]">
        {formatDate(date)}
      </div>

      <button
        onClick={goToNext}
        className={`shrink-0 px-1 md:px-2 py-1 text-white bg-blue-500 rounded-md
          hover:bg-blue-400 transition duration-300 ${
            handleState ? "cursor-not-allowed opacity-50" : ""
          }`}
        disabled={handleState}
      >
        <MdKeyboardArrowRight className="md:size-5" />
      </button>
    </div>
  );
}
