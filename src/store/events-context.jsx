/* eslint-disable react/prop-types */
import { createContext, useState } from "react";
import { toDateOnly } from "../util/dateOnly";

export const EventContext = createContext({
  saveEvent: () => {},
  fetchEventsByMonth: () => {},
  fetchEventsByRange: () => {},
  fetchEventReport: () => {},
  fetchEventTypes: () => {},
  createEventType: () => {},
  updateEventTypeById: () => {},
  deleteEventTypeById: () => {},
  updateEventById: () => {},
  deleteEventById: () => {},
  successOrFailMessage: null,
  triggerSucessOrFailMessage: () => {},
  triggerUpdate: () => {},
  updated: false,
});

const MONTH_NAMES = [
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

function toMonthToken(value) {
  const dateOnly = toDateOnly(value);
  if (!dateOnly) return "";

  const [year, month] = dateOnly.split("-");
  const monthIndex = Number(month) - 1;
  const monthName = MONTH_NAMES[monthIndex];

  if (!monthName) return "";
  return `${year}${monthName}`;
}

function normalizeEventRecord(eventRecord) {
  if (!eventRecord) return null;

  return {
    ...eventRecord,
    start: toDateOnly(eventRecord.start),
    end_date: toDateOnly(eventRecord.end_date),
  };
}

function normalizeEventCollection(eventRecords) {
  if (!Array.isArray(eventRecords)) return [];

  return eventRecords
    .map((eventRecord) => normalizeEventRecord(eventRecord))
    .filter(Boolean);
}

function normalizeEventReport(reportData) {
  if (!reportData || typeof reportData !== "object") {
    return { rows: [], summaryByType: {}, total: 0 };
  }

  return {
    ...reportData,
    rows: Array.isArray(reportData.rows)
      ? reportData.rows.map((row) => ({
          ...row,
          start: toDateOnly(row.start),
          end_date: toDateOnly(row.end_date),
        }))
      : [],
    summaryByType: reportData.summaryByType || {},
    total: Number(reportData.total) || 0,
  };
}

export default function EventContextProvider({ children }) {
  const [updated, setUpdated] = useState(false);
  const [successOrFailMessage, setSuccessOrFailMessage] = useState({
    successStatus: "",
    message: "",
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  async function requestJson(path, options = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include",
      ...options,
    });

    let parsedData = null;
    try {
      parsedData = await response.json();
    } catch {
      parsedData = null;
    }

    if (!response.ok) {
      const message = parsedData?.message || "Request failed.";
      throw new Error(message);
    }

    return parsedData;
  }

  function triggerUpdate() {
    setUpdated((prev) => !prev);
  }

  function triggerSucessOrFailMessage(status, message) {
    setSuccessOrFailMessage({
      successStatus: status,
      message,
    });

    setTimeout(() => {
      setSuccessOrFailMessage({
        successStatus: "",
        message: "",
      });
    }, 5000);
  }

  async function saveEvent(eventData) {
    try {
      const payload = {
        ...eventData,
        start: toDateOnly(eventData.start),
        end_date: toDateOnly(eventData.end_date || eventData.start),
      };

      const data = await requestJson("/events/new-event", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      triggerUpdate();
      triggerSucessOrFailMessage("success", data?.message || "Event saved.");
      return normalizeEventRecord(data?.data?.[0]) || null;
    } catch (error) {
      console.error("Error saving event:", error);
      triggerSucessOrFailMessage("fail", error.message || "Event save failed.");
      return null;
    }
  }

  async function updateEventById(eventId, eventData) {
    try {
      const payload = {
        ...eventData,
        start: toDateOnly(eventData.start),
        end_date: toDateOnly(eventData.end_date || eventData.start),
      };

      const data = await requestJson(`/events/update/${eventId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      triggerUpdate();
      triggerSucessOrFailMessage("success", data?.message || "Event updated.");
      return normalizeEventRecord(data?.data?.[0]) || null;
    } catch (error) {
      console.error("Error updating event:", error);
      triggerSucessOrFailMessage(
        "fail",
        error.message || "Event update failed.",
      );
      return null;
    }
  }

  async function deleteEventById(eventId) {
    try {
      const data = await requestJson(`/events/delete/${eventId}`, {
        method: "DELETE",
      });
      triggerUpdate();
      triggerSucessOrFailMessage("success", data?.message || "Event deleted.");
      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      triggerSucessOrFailMessage(
        "fail",
        error.message || "Event delete failed.",
      );
      return false;
    }
  }

  async function fetchEventsByMonth(date) {
    try {
      const monthToken = toMonthToken(date);
      if (!monthToken) return [];
      const data = await requestJson(`/events/${monthToken}`, {
        method: "GET",
      });

      return normalizeEventCollection(data?.data);
    } catch (error) {
      console.error("Error fetching events by month:", error);
      return [];
    }
  }

  async function fetchEventsByRange({
    start,
    end,
    employeeIds = [],
    eventTypeIds = [],
    search = "",
  }) {
    try {
      const params = new URLSearchParams();
      params.set("start", toDateOnly(start));
      params.set("end", toDateOnly(end));
      if (employeeIds.length > 0) {
        params.set("employeeIds", employeeIds.join(","));
      }
      if (eventTypeIds.length > 0) {
        params.set("eventTypeIds", eventTypeIds.join(","));
      }
      if (search.trim()) {
        params.set("search", search.trim());
      }

      const data = await requestJson(`/events/range?${params.toString()}`, {
        method: "GET",
      });

      return normalizeEventCollection(data?.data);
    } catch (error) {
      console.error("Error fetching events by range:", error);
      return [];
    }
  }

  async function fetchEventReport({
    start,
    end,
    employeeIds = [],
    eventTypeIds = [],
    search = "",
  }) {
    try {
      const params = new URLSearchParams();
      params.set("start", toDateOnly(start));
      params.set("end", toDateOnly(end));
      if (employeeIds.length > 0) {
        params.set("employeeIds", employeeIds.join(","));
      }
      if (eventTypeIds.length > 0) {
        params.set("eventTypeIds", eventTypeIds.join(","));
      }
      if (search.trim()) {
        params.set("search", search.trim());
      }

      const data = await requestJson(`/events/report?${params.toString()}`, {
        method: "GET",
      });

      return normalizeEventReport(data?.data);
    } catch (error) {
      console.error("Error fetching event report:", error);
      return { rows: [], summaryByType: {}, total: 0 };
    }
  }

  async function fetchEventTypes(includeInactive = false) {
    try {
      const params = includeInactive ? "?includeInactive=true" : "";
      const data = await requestJson(`/events/types${params}`, {
        method: "GET",
      });
      return data?.data || [];
    } catch (error) {
      console.error("Error fetching event types:", error);
      return [];
    }
  }

  async function createEventType(eventTypePayload) {
    try {
      const data = await requestJson("/events/types", {
        method: "POST",
        body: JSON.stringify(eventTypePayload),
      });
      triggerUpdate();
      triggerSucessOrFailMessage(
        "success",
        data?.message || "Event type created.",
      );
      return data?.data || null;
    } catch (error) {
      console.error("Error creating event type:", error);
      triggerSucessOrFailMessage(
        "fail",
        error.message || "Create event type failed.",
      );
      return null;
    }
  }

  async function updateEventTypeById(typeId, eventTypePayload) {
    try {
      const data = await requestJson(`/events/types/${typeId}`, {
        method: "PUT",
        body: JSON.stringify(eventTypePayload),
      });
      triggerUpdate();
      triggerSucessOrFailMessage(
        "success",
        data?.message || "Event type updated.",
      );
      return data?.data || null;
    } catch (error) {
      console.error("Error updating event type:", error);
      triggerSucessOrFailMessage(
        "fail",
        error.message || "Update event type failed.",
      );
      return null;
    }
  }

  async function deleteEventTypeById(typeId) {
    try {
      const data = await requestJson(`/events/types/${typeId}`, {
        method: "DELETE",
      });
      triggerUpdate();
      triggerSucessOrFailMessage(
        "success",
        data?.message || "Event type archived.",
      );
      return true;
    } catch (error) {
      console.error("Error archiving event type:", error);
      triggerSucessOrFailMessage(
        "fail",
        error.message || "Archive event type failed.",
      );
      return false;
    }
  }

  const contextValue = {
    fetchEventsByMonth,
    fetchEventsByRange,
    fetchEventReport,
    fetchEventTypes,
    createEventType,
    updateEventTypeById,
    deleteEventTypeById,
    saveEvent,
    triggerUpdate,
    triggerSucessOrFailMessage,
    successOrFailMessage,
    updated,
    updateEventById,
    deleteEventById,
  };

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
}
