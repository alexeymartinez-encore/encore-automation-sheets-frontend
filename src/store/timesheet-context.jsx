import { createContext, useEffect, useState } from "react";
import { isAuth } from "../util/fetching";

// Create the context and provide default values
export const TimesheetContext = createContext({
  timesheets: [],
  updated: null,
  triggerUpdate: () => {},
  fetchTimesheets: () => {}, // Expose a function to refetch timesheets
  successOrFailMessage: null,
  triggerSucessOrFailMessage: () => {},
  deleteTimesheetById: (id) => {},
});

export default function TimesheetContextProvider({ children }) {
  const [timesheets, setTimesheets] = useState([]);
  const [updated, setUpdated] = useState(false);
  const [successOrFailMessage, setSuccessOrFailMessage] = useState({
    successStatus: "",
    message: "",
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  async function fetchTimesheets() {
    const userId = localStorage.getItem("userId");
    try {
      const response = await fetch(`${BASE_URL}/timesheets/${userId}`, {
        headers: {
          // Authorization: "Bearer " + token,
        },
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setTimesheets(data.data);
        setUpdated(false);
      } else {
        console.log("Error fetching timesheets");
      }
    } catch (error) {
      console.error("Error fetching timesheets:", error);
    }
  }

  async function deleteTimesheetById(id) {
    if (id) {
      try {
        const deleteResponse = await fetch(
          `${BASE_URL}/timesheets/delete-timesheet/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!deleteResponse.ok) {
          throw new Error("Error deletting the row from the server");
        }
        const data = await deleteResponse.json();
        triggerUpdate();
        triggerSucessOrFailMessage(data.internalStatus, data.message);
        return deleteResponse;
      } catch (error) {
        console.error("Error deleting row: ", error);
        return;
      }
    } else {
      triggerSucessOrFailMessage("fail", "Timesheet Failed to be Deleted");
      return;
    }
  }

  useEffect(() => {
    async function init() {
      const authenticated = await isAuth(); // 👈 actually calls isAuth and gets true/false
      if (authenticated) {
        fetchTimesheets();
      }
    }
    init();
  }, [updated]);

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

  const timesheetsCtxValues = {
    timesheets: timesheets,
    fetchTimesheets: fetchTimesheets,
    triggerUpdate: triggerUpdate,
    triggerSucessOrFailMessage: triggerSucessOrFailMessage,
    successOrFailMessage: successOrFailMessage,
    deleteTimesheetById: deleteTimesheetById,
  };

  return (
    <TimesheetContext.Provider value={timesheetsCtxValues}>
      {children}
    </TimesheetContext.Provider>
  );
}
