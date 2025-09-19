import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import VacationCard from "./PersonalAnalysisComponents/VacationCard";
import SickCard from "./PersonalAnalysisComponents/SickCard";
export default function AnalysisSection() {
  const percentage = 6;

  return (
    <div className="bg-white  shadow-xs rounded-lg p-5">
      <h1 className="text-2xl text-blue-500 ">Personal Analysis</h1>
      {/* <div className="flex flex-col py-5">
        <VacationCard />
        <SickCard />
      
      </div>  */}

      <CircularProgressbar
        className="h-[10rem] text-center mt-20"
        value={percentage}
        maxValue={15}
        text="Coming Soon"
        // text={`${percentage}%`}
        styles={buildStyles({
          textColor: "#000",
          pathColor: "#3e98c7",
          trailColor: "#d6d6d6",
          textSize: 10,
        })}
      />
    </div>
  );
}
