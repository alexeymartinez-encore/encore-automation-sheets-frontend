import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./custom-calendar.css"; // Import the custom CSS

const localizer = momentLocalizer(moment);

export default function EventsCard() {
  const [events, setEvents] = useState([
    {
      title: "Meeting",
      start: new Date(),
      end: new Date(),
      backgroundColor: "#FF5733", // Custom background color
      textColor: "#FFFFFF", // Custom text color
    },
    {
      title: "Workshop",
      start: new Date(),
      end: new Date(),
      backgroundColor: "#33B5FF", // Custom background color
      textColor: "#000000", // Custom text color
    },
    {
      title: "Long Meeting Title That Requires More Space",
      start: new Date(),
      end: new Date(),
      backgroundColor: "#FF5733", // Custom background color
      textColor: "#FFFFFF", // Custom text color
    },
    {
      title: "Another Workshop",
      start: new Date(),
      end: new Date(),
      backgroundColor: "#33B5FF", // Custom background color
      textColor: "#000000", // Custom text color
    },
    {
      title: "Team Sync",
      start: new Date(),
      end: new Date(),
      backgroundColor: "#FF5733", // Custom background color
      textColor: "#FFFFFF", // Custom text color
    },
  ]);

  // Custom event styling
  const eventPropGetter = (event) => {
    const backgroundColor = event.backgroundColor || "#3174ad";
    const color = event.textColor || "white";
    return {
      style: {
        backgroundColor,
        color,
        borderRadius: "5px",
        border: "none",
        padding: "5px",
      },
    };
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        views={["month"]}
        style={{ height: 1000 }}
        className="text-xs"
        eventPropGetter={eventPropGetter}
      />
    </div>
  );
}
