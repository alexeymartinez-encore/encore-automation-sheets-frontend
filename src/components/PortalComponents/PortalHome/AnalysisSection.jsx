import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
export default function AnalysisSection() {
  const percentage = 66;

  return (
    <div className="bg-white  shadow-xs rounded-lg p-5">
      <h1 className="text-2xl text-blue-500">Personal Analysis</h1>
      <CircularProgressbar
        className="h-[10rem] text-center mt-20"
        value={percentage}
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
