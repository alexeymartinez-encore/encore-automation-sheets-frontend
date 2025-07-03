import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { formatDate } from "../../../../../util/helper";

export default function DateNavigationBtns({
  goToPrevious,
  goToNext,
  date,
  handleState,
}) {
  return (
    <div className="flex items-center space-x-4 h-3">
      <button
        onClick={goToPrevious}
        className={`px-1 md:px-2 py-1 text-white bg-blue-500 rounded-md
           hover:bg-blue-400 transition duration-300 ${
             handleState ? "cursor-not-allowed opacity-50" : ""
           }`}
      >
        <MdKeyboardArrowLeft className="md:size-5" />
      </button>

      <div className=" text-[0.6rem] md:text-xs font-medium text-gray-700">
        {formatDate(date)}
      </div>

      <button
        onClick={goToNext}
        className={`px-1 md:px-2 py-1 text-white bg-blue-500 rounded-md
          hover:bg-blue-400 transition duration-300 ${
            handleState ? "cursor-not-allowed opacity-50" : ""
          }`}
      >
        <MdKeyboardArrowRight className="md:size-5" />
      </button>
    </div>
  );
}
