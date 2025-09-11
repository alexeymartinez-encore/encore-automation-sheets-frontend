import React, { useContext, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // Import the interaction plugin
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";

import "./custom-calendar.css"; // Import your custom CSS
import AddNewEvent from "./AddNewEvent";
import { EventContext } from "../../../store/events-context";

export default function FullCalendarComponent({ eventsData = [] }) {
  const eventCtx = useContext(EventContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // Default to today
  const myEvents = events.filter(
    (event) => Number(localStorage.getItem("userId")) === event.employee_id
  );
  const [currentMonth, setCurrentMonth] = useState("");

  // Handle date click
  function handleDateClick(info) {
    setSelectedDate(info.dateStr);
  }

  // Handle view change
  function handleDatesSet(info) {
    const currentMonth = new Date(info.view.currentStart)
      .toISOString()
      .split("T")[0];
    setCurrentMonth(currentMonth);
  }

  // Fetch events only once
  useEffect(() => {
    if (currentMonth) {
      async function fetchEvents() {
        const fetchedEvents = await eventCtx.fetchEventsByMonth(currentMonth);
        setEvents(fetchedEvents.data || []);
      }
      fetchEvents();
    }
  }, [eventCtx, currentMonth]);

  // Filter events based on the selected date
  useEffect(() => {
    const filtered = events.filter((event) => {
      const eventDate = new Date(event.start).toISOString().split("T")[0];
      return eventDate === selectedDate;
    });
    setFilteredEvents(filtered);
  }, [selectedDate, events]);

  const [newEvent, setNewEvent] = useState({
    employee_id: "",
    start: "",
    end_date: "",
    long_description: "",
    back_color_id: "#000000",
    fore_color_id: "#FF5733",
    title: "",
    formatted_month: "",
  });

  async function addEvent() {
    if (newEvent.title && newEvent.start) {
      eventCtx.saveEvent({
        ...newEvent,
        employee_id: localStorage.getItem("userId"),
      });

      setNewEvent({
        employee_id: "",
        start: "",
        end_date: "",
        long_description: "",
        back_color_id: "#000000",
        fore_color_id: "#FF5733",
        title: "",
        formatted_month: "",
      });
    } else {
      alert("Please provide a valid title and start date!");
    }
  }

  function handleEditEvent(eventId) {
    const event = events.filter((event) => eventId === event.id);
    eventCtx.updateEventById(eventId, event);
  }
  function handleDeleteEvent(eventId) {
    eventCtx.deleteEventById(eventId);
  }

  function handleEventChange(e, eventId, field) {
    const updatedValue = e.target.value;

    setEvents((prevEvents) =>
      prevEvents.map((ev) =>
        ev.id === eventId && ev[field] !== updatedValue
          ? { ...ev, [field]: updatedValue }
          : ev
      )
    );
  }

  console.log(events);

  return (
    <div>
      {/* Add New Event Section */}
      <div className="flex flex-col items-center md:items-end text-xs bg-white shadow-sm rounded-md">
        <AddNewEvent
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          addEvent={addEvent}
        />
        <div className="p-5">
          <button
            className="flex items-center gap-2 bg-blue-500 text-white py-2  px-3 rounded-md hover:bg-blue-400 transition duration-400 mt-2 "
            onClick={addEvent}
          >
            <FaPlus />
            Add Event
          </button>
        </div>
      </div>

      {/* List of Events for Selected Date */}
      <div className="bg-white p-2 my-5 rounded-md shadow-md text-xs">
        <h3 className="text-center text-lg font-bold mb-3">
          Events for {selectedDate}
        </h3>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="px-10 border my-2 rounded-md">
              <div className="grid grid-cols-[1.5fr_2fr_3fr_1.5fr_1fr] items-center gap-4 py-2 w-full text-sm">
                {/* Column 1 - Employee Name */}
                <p className="text-center">
                  {event.Employee.first_name} {event.Employee.last_name}
                </p>

                {/* Column 2 - Dates */}
                <div className="flex gap-2 items-center justify-center">
                  <input
                    type="date"
                    value={event.start}
                    onChange={(e) => handleEventChange(e, event.id, "start")}
                    readOnly={
                      event.employee_id !==
                      Number(localStorage.getItem("userId"))
                    }
                    className="text-center border rounded px-1"
                  />
                  <input
                    type="date"
                    value={event.end_date}
                    onChange={(e) => handleEventChange(e, event.id, "end_date")}
                    readOnly={
                      event.employee_id !==
                      Number(localStorage.getItem("userId"))
                    }
                    className="text-center border rounded px-1"
                  />
                </div>

                {/* Column 3 - Title + Description */}
                <div className="flex gap-2 items-center justify-center">
                  <input
                    type="text"
                    value={event.title}
                    onChange={(e) => handleEventChange(e, event.id, "title")}
                    readOnly={
                      event.employee_id !==
                      Number(localStorage.getItem("userId"))
                    }
                    className="flex-1 text-center border rounded px-1"
                  />
                  <input
                    type="text"
                    value={event.long_description}
                    onChange={(e) =>
                      handleEventChange(e, event.id, "long_description")
                    }
                    readOnly={
                      event.employee_id !==
                      Number(localStorage.getItem("userId"))
                    }
                    className="flex-1 text-center border rounded px-1"
                  />
                </div>

                {/* Column 4 - Colors */}
                <div className="flex gap-2 items-center justify-center">
                  <input
                    type="color"
                    value={event.back_color_id}
                    onChange={(e) =>
                      handleEventChange(e, event.id, "back_color_id")
                    }
                    readOnly={
                      event.employee_id !==
                      Number(localStorage.getItem("userId"))
                    }
                    className="w-7 h-7 rounded-full cursor-pointer"
                  />
                  <input
                    type="color"
                    value={event.fore_color_id}
                    onChange={(e) =>
                      handleEventChange(e, event.id, "fore_color_id")
                    }
                    readOnly={
                      event.employee_id !==
                      Number(localStorage.getItem("userId"))
                    }
                    className="w-7 h-7 rounded-full cursor-pointer"
                  />
                </div>

                {/* Column 5 - Actions */}
                <div className="flex gap-2 items-center justify-center">
                  {event.employee_id ===
                    Number(localStorage.getItem("userId")) && (
                    <>
                      <button
                        type="button"
                        className="rounded-sm"
                        onClick={() => handleEditEvent(event.id)}
                      >
                        <FaEdit className="text-blue-500" size={20} />
                      </button>
                      <button
                        type="button"
                        className="rounded-sm"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <MdDeleteForever className="text-red-500" size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No events for this date.</p>
        )}
      </div>

      {/* Calendar Section */}
      <div className="bg-white h-full shadow-md rounded-md p-1 md:p-10 my-4 text-blue-500">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          // buttonText={}
          titleFormat={{ year: "numeric", month: "long" }}
          eventContent={(eventInfo) => {
            return (
              <div
                style={{
                  backgroundColor: eventInfo.event.extendedProps.back_color_id,
                  color: eventInfo.event.extendedProps.fore_color_id,
                  padding: "1px 5px",
                  borderRadius: "0.1rem",
                }}
              >
                {eventInfo.event.title}
              </div>
            );
          }}
          dateClick={handleDateClick}
          datesSet={handleDatesSet}
          height="auto"
          eventDataTransform={(event) => ({
            ...event,
            end: new Date(
              new Date(event.end_date).setDate(
                new Date(event.end_date).getDate() + 1
              )
            ), // Adding 1 day to make end inclusive
          })}
        />
      </div>
    </div>
  );
}
