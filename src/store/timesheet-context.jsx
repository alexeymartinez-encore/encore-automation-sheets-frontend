import PropTypes from "prop-types";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { isAuth } from "../util/fetching";

// Create the context and provide default values
export const TimesheetContext = createContext({
  timesheets: [],
  updated: null,
  triggerUpdate: () => {},
  fetchTimesheets: () => {}, // Expose a function to refetch timesheets
  successOrFailMessage: null,
  triggerSucessOrFailMessage: () => {},
  deleteTimesheetById: () => {},
});

export default function TimesheetContextProvider({ children }) {
  const [timesheets, setTimesheets] = useState([]);
  const [updated, setUpdated] = useState(0);
  const [successOrFailMessage, setSuccessOrFailMessage] = useState({
    successStatus: "",
    message: "",
  });
  const latestFetchIdRef = useRef(0);

  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  const fetchTimesheets = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    const fetchId = latestFetchIdRef.current + 1;
    latestFetchIdRef.current = fetchId;

    try {
      const response = await fetch(`${BASE_URL}/timesheets/${userId}`, {
        headers: {
          // Authorization: "Bearer " + token,
        },
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        if (fetchId === latestFetchIdRef.current) {
          setTimesheets(data.data || []);
        }
        return data.data || [];
      } else {
        console.log("Error fetching timesheets");
        return [];
      }
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      return [];
    }
  }, [BASE_URL]);

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
  }, [fetchTimesheets, updated]);

  function triggerUpdate() {
    setUpdated((previousValue) => previousValue + 1);
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

TimesheetContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
