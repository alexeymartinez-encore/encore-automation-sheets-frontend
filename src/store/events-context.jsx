import { createContext, useState } from "react";

// Create the context
export const EventContext = createContext({
  saveEvent: (event) => {},
  fetchEventsByMonth: () => {},
  updateEventById: (id, event) => {},
  deleteEventById: (id) => {},
  successOrFailMessage: null,
  triggerSucessOrFailMessage: () => {},
  triggerUpdate: () => {},
  updated: false,
});

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function EventContextProvider({ children }) {
  const [updated, setUpdated] = useState(false);
  const [successOrFailMessage, setSuccessOrFailMessage] = useState({
    successStatus: "",
    message: "",
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  async function saveEvent(eventData) {
    const date = eventData.start;
    // Extracting year and month from the date string
    const [year, month] = date.split("-");

    // Convert month number to month abbreviation
    const formattedMonth = `${year}${monthNames[parseInt(month) - 1]}`;

    console.log(formattedMonth); // Example output: "2025Jan"
    eventData.formatted_month = formattedMonth;
    const startDate = new Date(eventData.start);
    const endDate = new Date(eventData.end_date);
    eventData.start = startDate.toISOString().split("T")[0]; // Formats as YYYY-MM-DD
    eventData.end_date = endDate.toISOString().split("T")[0]; // Formats as YYYY-MM-DD

    // console.log(eventData);

    try {
      const response = await fetch(`${BASE_URL}/events/new-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error("Error saving event");
      }
      triggerUpdate();
      triggerSucessOrFailMessage("success", "Saved Event Successfuly");
      const data = await response.json();
      console.log(data);

      return data;
    } catch (error) {
      console.error("Error saving event: ", error);
      return;
    }
  }

  async function fetchEventsByMonth(date) {
    // Extracting year and month from the date string
    const [year, month] = date.split("-");

    // Convert month number to month abbreviation
    const formattedMonth = `${year}${monthNames[parseInt(month) - 1]}`;

    try {
      const response = await fetch(`${BASE_URL}/events/${formattedMonth}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error saving event");
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Error saving event: ", error);
      return;
    }
  }

  function triggerUpdate() {
    setUpdated(true);
  }

  function triggerSucessOrFailMessage(status, message) {
    setSuccessOrFailMessage({
      successStatus: status, // needs to be "success" or "fail"
      message: message,
    });

    // Set a timeout to reset the state after 3 seconds (3000 ms)
    setTimeout(() => {
      setSuccessOrFailMessage({
        successStatus: "",
        message: "",
      });
    }, 5000);
  }

  async function updateEventById(eventId, event) {
    try {
      const response = await fetch(`${BASE_URL}/events/update/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(event[0]),
      });

      if (!response.ok) {
        throw new Error("Error updating event");
      }

      const data = await response.json();
      // console.log(data);
      triggerUpdate();
      triggerSucessOrFailMessage(data.internalStatus, data.message);
      return data;
    } catch (error) {
      // console.error("Error Updating event: ", error);
      triggerUpdate();
      triggerSucessOrFailMessage("fail", "Edit Event Failed");
      return;
    }
  }

  async function deleteEventById(eventId) {
    try {
      const response = await fetch(`${BASE_URL}/events/delete/${eventId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error Deleting event");
      }

      const data = await response.json();
      triggerUpdate();
      triggerSucessOrFailMessage(data.internalStatus, data.message);
      return data;
    } catch (error) {
      triggerUpdate();
      triggerSucessOrFailMessage("fail", "Delete Event Failed");
      return;
    }
  }

  const contextValue = {
    fetchEventsByMonth: fetchEventsByMonth,
    saveEvent: saveEvent,
    triggerUpdate: triggerUpdate,
    triggerSucessOrFailMessage: triggerSucessOrFailMessage,
    successOrFailMessage: successOrFailMessage,
    updated: updated,
    updateEventById: updateEventById,
    deleteEventById: deleteEventById,
  };

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
}
