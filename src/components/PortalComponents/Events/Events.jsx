import EventsCard from "./EventsCard";
import FullCalendarComponent from "./FullCalendarComponent";

export default function Events() {
  return (
    <div className="w-full  py-4 overflow-auto">
      {/* <div className="p-5 bg-white  shadow-md rounded-md">
        <h1 className="text-2xl text-blue-500">Events</h1>
      </div> */}

      {/* <EventsCard /> */}
      <FullCalendarComponent />
    </div>
  );
}
