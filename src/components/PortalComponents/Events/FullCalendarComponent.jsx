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
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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
      setShowModal((prev) => !prev);
    } else {
      alert("Please provide a valid title and start date!");
    }
  }

  function handleEditEvent(eventId) {
    const event = events.filter((event) => eventId === event.id);
    eventCtx.updateEventById(eventId, event);
    setShowEditModal((prev) => !prev);
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

  function toggleModal() {
    setShowModal((prev) => !prev);
  }

  function toggleEditModal() {
    setShowEditModal((prev) => !prev);
  }

  return (
    <div>
      {/* Add New Event Section */}
      {showModal && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={toggleModal}
        >
          <div
            className="flex flex-col items-center w-full md:w-1/3 mx-5 text-xs bg-white shadow-sm rounded-md"
            onClick={(e) => e.stopPropagation()}
          >
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
        </div>
      )}

      {/* Calendar Section */}
      <div className="bg-white h-full shadow-sm rounded-md p-1 md:p-10 my-1 text-blue-500">
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

      {/* List of Events for Selected Date */}
      <div className="bg-white p-2 my-5 rounded-md shadow-sm text-xs py-5">
        <div className="flex flex-col md:flex-row items-center justify-between px-10 ">
          <h3 className="text-center text-lg font-bold mb-3 text-blue-500">
            Events for {selectedDate}
          </h3>
          <button
            className="flex items-center justify-center gap-2 bg-blue-500 text-white py-2  px-3 rounded-md hover:bg-blue-400 transition duration-400 mb-5 w-1/2 md:w-[10rem]"
            onClick={toggleModal}
          >
            <FaPlus />
            New Event
          </button>
        </div>
        <div className="border-t py-5">
          <div
            className="grid grid-cols-[0.5fr,1.5fr,1.5fr,1.5fr,0.5fr] md:grid-cols-[1fr,1fr,1fr,2fr,2fr,0.5fr,0.5fr] items-center
          text-blue-500 gap-4 pb-1 w-full text-xs"
          >
            <p className="text-center md:hidden block">-</p>
            <p className="text-start md:text-center">Name</p>
            <p className="text-center">Start</p>
            <p className="text-center">End</p>
            <p className="text-center hidden md:block">Text</p>
            <p className="text-center hidden md:block">Desc</p>
            <p className="text-center hidden md:block">Color</p>
            <p className="text-center">-</p>
          </div>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div key={event.id} className="px-0 border my-2 rounded-sm">
                {showEditModal && (
                  <div
                    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
                    onClick={toggleEditModal}
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex flex-col items-center w-full md:w-1/3 mx-5 text-xs bg-white shadow-sm rounded-md gap-3 py-5"
                    >
                      <div className="flex flex-col items-center gap-1 justify-between w-full px-10">
                        <label className="text-blue-500 text-start">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={event.start}
                          onChange={(e) =>
                            handleEventChange(e, event.id, "start")
                          }
                          className="text-center border rounded p-1  w-2/3"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1 justify-between w-full px-10">
                        <label className="text-blue-500  text-start">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={event.end_date}
                          onChange={(e) =>
                            handleEventChange(e, event.id, "end_date")
                          }
                          className="text-center border rounded p-1 w-2/3"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1 justify-between w-full px-10">
                        <label className="text-blue-500 text-start">Text</label>
                        <input
                          type="text"
                          value={event.title}
                          onChange={(e) =>
                            handleEventChange(e, event.id, "title")
                          }
                          className="flex-1 text-center border rounded p-1 w-2/3"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1 justify-between w-full px-10">
                        <label className="text-blue-500 text-start">
                          Description
                        </label>
                        <input
                          type="text"
                          value={event.long_description}
                          onChange={(e) =>
                            handleEventChange(e, event.id, "long_description")
                          }
                          className="flex-1 text-center border rounded p-1 w-2/3"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1 justify-between w-full px-10">
                        <label className="text-blue-500 text-start">
                          Background Color
                        </label>
                        <input
                          type="color"
                          value={event.back_color_id}
                          onChange={(e) =>
                            handleEventChange(e, event.id, "back_color_id")
                          }
                          className="  cursor-pointer w-2/3"
                        />{" "}
                      </div>{" "}
                      <div className="flex flex-col items-center gap-1 justify-between w-full px-10">
                        <label className="text-blue-500 text-start">
                          Text Color
                        </label>
                        <input
                          type="color"
                          value={event.fore_color_id}
                          onChange={(e) =>
                            handleEventChange(e, event.id, "fore_color_id")
                          }
                          className="cursor-pointer w-2/3"
                        />
                      </div>
                      <button
                        type="button"
                        className="text-white bg-blue-500 hover:bg-blue-400 rounded-sm w-1/2 py-2 mt-3"
                        onClick={() => handleEditEvent(event.id)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-[0.5fr,1.5fr,1.5fr,1.5fr,0.5fr] md:grid-cols-[1fr,1fr,1fr,2fr,2fr,0.5fr,0.5fr] items-center gap-4 py-2 w-full text-xs">
                  <div className="flex justify-around md:hidden">
                    {event.employee_id ===
                      Number(localStorage.getItem("userId")) && (
                      <>
                        <button
                          type="button"
                          className="rounded-sm md:hidden block"
                          // onClick={() => handleEditEvent(event.id)}
                          onClick={toggleEditModal}
                        >
                          <FaEdit className="text-blue-500 size-4 md:size-5" />
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-start md:text-center">
                    {event.Employee.first_name} {event.Employee.last_name}
                  </p>
                  <p className="text-center">{event.start}</p>
                  <p className="text-center">{event.end_date}</p>
                  <p className="text-center hidden md:block">{event.title}</p>
                  <p className="text-center hidden md:block">
                    {event.long_description}
                  </p>
                  <div className="hidden md:flex">
                    <input
                      type="color"
                      value={event.back_color_id}
                      onChange={(e) =>
                        handleEventChange(e, event.id, "back_color_id")
                      }
                      readOnly={true}
                      disabled
                      className="  cursor-not-allowed"
                    />
                    <input
                      type="color"
                      value={event.fore_color_id}
                      onChange={(e) =>
                        handleEventChange(e, event.id, "fore_color_id")
                      }
                      readOnly={true}
                      disabled
                      className="  cursor-not-allowed"
                    />
                  </div>

                  <div className="flex justify-around">
                    {event.employee_id ===
                      Number(localStorage.getItem("userId")) && (
                      <>
                        <button
                          type="button"
                          className="rounded-sm hidden md:block"
                          onClick={toggleEditModal}
                        >
                          <FaEdit className="text-blue-500 size-4 md:size-5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-sm "
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <MdDeleteForever className="text-red-500 size-4 md:size-5" />
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
      </div>
    </div>
  );
}
