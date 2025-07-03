import { useState } from "react";
import NavigationLinks from "./NavigationLinks";
import { AnimatePresence, motion } from "framer-motion";
// import NavigationLinks from "./NavigationLinks";

function Hamburger() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="m-8  md:hidden justify-center z-10">
      <button
        onClick={handleClick}
        type="button"
        className="h-10 w-10 grid justify-center items-center gap-1.5"
      >
        <div className="grid  gap-1.5">
          <span
            className={`h-1 w-8 rounded-full transition duration-500 ${
              isOpen ? "rotate-45 translate-y-2.5 bg-gray-900" : "bg-gray-500"
            }`}
          ></span>
          <span
            className={`h-1 w-8 rounded-full  transition duration-500  ${
              isOpen ? "scale-x-0" : "bg-gray-500"
            }`}
          ></span>
          <span
            className={`h-1 w-8 rounded-full  transition duration-500  ${
              isOpen ? "-rotate-45 -translate-y-2.5 bg-gray-900" : "bg-gray-500"
            }`}
          ></span>
        </div>
      </button>
      <AnimatePresence wait>
        {isOpen === true ? (
          <motion.div
            initial={{ opacity: 0, y: -200 }}
            animate={{ opacity: isOpen ? 0.9 : 0, y: isOpen ? 0 : -200 }}
            transition={{ type: "spring", stiffness: 50 }}
            exit={{ opacity: 0, y: -200 }}
            className="absolute top-full left-0 w-full"
          >
            <div
              className={`flex flex-col items-center text-gray-900 px-10
               transition duration-1000 bg-white`}
            >
              <NavigationLinks />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default Hamburger;
