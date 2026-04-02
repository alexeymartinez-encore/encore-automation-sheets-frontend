import PropTypes from "prop-types";
import { createContext, useState } from "react";

// Create the context
export const AdminContext = createContext({
  users: [],
  getUsersTimesheetsByDate: () => {},
  getUsersExpensesByDate: () => {},
  getMissingTimesheetsByDate: () => {},
  getMissingExpensesByDate: () => {},
  sendMissingTimesheetReminders: () => {},
  sendMissingExpenseReminders: () => {},
  saveTimesheetsStatusChanges: () => {},
  saveExpensesStatusChanges: () => {},
  getAllEmployees: () => {},
  getAllProjects: () => {},
  fetchOvertimeData: () => {},
  fetchBereavementData: () => {},
  fetchJuryDutyData: () => {},
  fetchSickData: () => {},
  fetchVacationData: () => {},
  fetchCategoryEntriesData: () => {},
  fetchExpenseReportData: () => {},
  fetchOpenExpenseReportData: () => {},
  successOrFailMessage: null,
  triggerSucessOrFailMessage: () => {},
  triggerUpdate: () => {},
  createNewProject: () => {},
  deleteProjectById: () => {},
  editProjectById: () => {},
  editUserById: () => {},
  fetchLaborData: () => {},
  getOpenExpenses: () => {},
  getOpenTimesheets: () => {},
});

export default function AdminContextProvider({ children }) {
  const [, setUpdated] = useState(false);
  const [successOrFailMessage, setSuccessOrFailMessage] = useState({
    successStatus: "",
    message: "",
  });
  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  async function fetchWithRoleFallback(adminPath, managerPath, options) {
    const adminUrl = `${BASE_URL}${adminPath}`;
    let response = await fetch(adminUrl, options);

    if (response.status === 403 && managerPath) {
      const managerUrl = `${BASE_URL}${managerPath}`;
      response = await fetch(managerUrl, options);
    }

    return response;
  }

  async function getUsersTimesheetsByDate(weekEnding) {
    try {
      const response = await fetchWithRoleFallback(
        `/admin/timesheets/${weekEnding}`,
        `/manager/timesheets/${weekEnding}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting timesheets server");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error deleting row: ", error);
      return;
    }
  }

  async function fetchOvertimeData(date) {
    try {
      const response = await fetchWithRoleFallback(
        `/admin/timesheets/overtime-report/${date}`,
        `/manager/timesheets/overtime-report/${date}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting timesheets server");
      }

      const data = await response.json();

      console.log(data);
      return data.data || [];
    } catch (error) {
      console.error("Error deleting row: ", error);
      return;
    }
  }

  async function fetchVacationData(date) {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/timesheets/vacation-report/${date}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting timesheets server");
      }

      const data = await response.json();
      console.log(data);
      return data.data || [];
    } catch (error) {
      console.error("Error Fetching Timesheets row: ", error);
      return;
    }
  }

  async function fetchSickData(date) {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/timesheets/sick-report/${date}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting timesheets server");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error deleting row: ", error);
      return;
    }
  }

  async function fetchJuryDutyData(date) {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/timesheets/juryduty-report/${date}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting timesheets server");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error deleting row: ", error);
      return;
    }
  }

  async function fetchBereavementData(date) {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/timesheets/bereavement-report/${date}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting timesheets server");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error deleting row: ", error);
      return;
    }
  }

  async function fetchLaborData(date) {
    try {
      const response = await fetchWithRoleFallback(
        `/admin/timesheets/labor-report/${date}`,
        `/manager/timesheets/labor-report/${date}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting timesheets server");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error deleting row: ", error);
      return;
    }
  }

  async function fetchExpenseReportData(date) {
    try {
      const response = await fetchWithRoleFallback(
        `/admin/expenses/expense-report/${date}`,
        `/manager/timesheets/expense-report/${date}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting timesheets server");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error deleting row: ", error);
      return;
    }
  }

  async function fetchOpenExpenseReportData(date) {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/expenses/expense-report-open/${date}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting timesheets server");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error deleting row: ", error);
      return;
    }
  }

  async function fetchCategoryEntriesData(payload) {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/timesheets/category-entries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Error getting timesheet entries");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching category entries: ", error);
      return;
    }
  }

  async function getAllEmployees() {
    try {
      const response = await fetchWithRoleFallback(
        "/admin/employees/get-all",
        "/manager/employees/get-all",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting timesheets server");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error deleting row: ", error);
      return;
    }
  }

  async function getAllProjects() {
    try {
      const response = await fetchWithRoleFallback(
        "/admin/projects/get-all",
        "/manager/projects/get-all",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting projects server");
      }

      const data = await response.json();

      return data.data || [];
    } catch (error) {
      console.error("Error deleting row: ", error);
      return;
    }
  }

  async function createNewProject(projectData) {
    try {
      const response = await fetch(`${BASE_URL}/admin/projects/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(projectData),
      });
      if (!response.ok) {
        throw new Error("Error getting projects server");
      }
      const data = await response.json();
      triggerUpdate();
      triggerSucessOrFailMessage(data.internalStatus, `${data.message}`);
      return data.data || [];
    } catch (error) {
      console.error("Error deleting row: ", error);
      triggerUpdate();
      triggerSucessOrFailMessage("fail", "Project creation failed");
      return;
    }
  }

  async function deleteProjectById(id) {
    if (id) {
      try {
        const deleteResponse = await fetch(
          `${BASE_URL}/admin/projects/delete/${id}`,
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

  async function editProjectById(projectId, project) {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/projects/edit/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(project),
        }
      );

      if (!response.ok) {
        throw new Error("Error updating event");
      }

      const data = await response.json();
      triggerUpdate();
      triggerSucessOrFailMessage(data.internalStatus, data.message);
      return data;
    } catch (error) {
      console.error("Error Updating event: ", error);
      triggerUpdate();
      triggerSucessOrFailMessage("fail", "Edit Event Failed");
      return;
    }
  }
  async function editUserById(userId, user) {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/employees/edit/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(user),
        }
      );

      if (!response.ok) {
        throw new Error("Error updating event");
      }

      const data = await response.json();
      triggerUpdate();
      triggerSucessOrFailMessage(data.internalStatus, data.message);
      return data;
    } catch (error) {
      console.error("Error Updating event: ", error);
      triggerUpdate();
      triggerSucessOrFailMessage("fail", "Edit Event Failed");
      return;
    }
  }
  async function getUsersExpensesByDate(dateStart) {
    try {
      const response = await fetchWithRoleFallback(
        `/admin/expenses/${dateStart}`,
        `/manager/expenses/${dateStart}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting expenses server");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error deleting row: ", error);
      return;
    }
  }

  async function getOpenExpenses(date) {
    try {
      const selectedDate = date || new Date();
      const response = await fetchWithRoleFallback(
        `/admin/open-expenses/${selectedDate}`,
        "/manager/open-expenses",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting expenses server");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error getting open expenses: ", error);
      return;
    }
  }

  async function getOpenTimesheets() {
    try {
      const response = await fetch(`${BASE_URL}/admin/open-timesheets`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error getting expenses server");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error getting open expenses: ", error);
      return;
    }
  }

  async function getMissingTimesheetsByDate(weekEnding) {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/timesheets/missing/${weekEnding}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting missing timesheets");
      }

      const data = await response.json();
      return (
        data.data || {
          missingEmployees: [],
          activeEmployeeCount: 0,
          completedCount: 0,
        }
      );
    } catch (error) {
      console.error("Error getting missing timesheets: ", error);
      return {
        missingEmployees: [],
        activeEmployeeCount: 0,
        completedCount: 0,
      };
    }
  }

  async function getMissingExpensesByDate(dateStart) {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/expenses/missing/${dateStart}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error getting missing expenses");
      }

      const data = await response.json();
      return (
        data.data || {
          missingEmployees: [],
          activeEmployeeCount: 0,
          completedCount: 0,
        }
      );
    } catch (error) {
      console.error("Error getting missing expenses: ", error);
      return {
        missingEmployees: [],
        activeEmployeeCount: 0,
        completedCount: 0,
      };
    }
  }

  async function sendMissingTimesheetReminders(payload) {
    try {
      const response = await fetch(`${BASE_URL}/admin/timesheets/missing/remind`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Could not send timesheet reminders");
      }

      triggerSucessOrFailMessage(
        data.internalStatus || "success",
        data.message || "Timesheet reminders sent."
      );
      return data.data || null;
    } catch (error) {
      console.error("Error sending timesheet reminders: ", error);
      triggerSucessOrFailMessage(
        "fail",
        error.message || "Could not send timesheet reminders."
      );
      return null;
    }
  }

  async function sendMissingExpenseReminders(payload) {
    try {
      const response = await fetch(`${BASE_URL}/admin/expenses/missing/remind`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Could not send expense reminders");
      }

      triggerSucessOrFailMessage(
        data.internalStatus || "success",
        data.message || "Expense reminders sent."
      );
      return data.data || null;
    } catch (error) {
      console.error("Error sending expense reminders: ", error);
      triggerSucessOrFailMessage(
        "fail",
        error.message || "Could not send expense reminders."
      );
      return null;
    }
  }

  async function saveTimesheetsStatusChanges(timesheetData) {
    try {
      const response = await fetchWithRoleFallback(
        "/admin/timesheets/status-change",
        "/manager/timesheets/status-change",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(timesheetData),
        }
      );

      if (!response.ok) {
        throw new Error("Error getting expenses server");
      }

      const data = await response.json();
      triggerUpdate();
      triggerSucessOrFailMessage("success", "Saved Changes Successfuly");

      return data;
    } catch (error) {
      console.error("Error deleting row: ", error);
      triggerSucessOrFailMessage("fail", "Could not save changes");
      return;
    }
  }

  async function saveExpensesStatusChanges(expenseData) {
    try {
      const response = await fetchWithRoleFallback(
        "/admin/expenses/status-change",
        "/manager/expenses/status-change",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(expenseData),
        }
      );

      if (!response.ok) {
        throw new Error("Error getting expenses server");
      }

      const data = await response.json();
      triggerUpdate();
      triggerSucessOrFailMessage("success", "Saved Changes Successfuly");
      return data;
    } catch (error) {
      console.error("Error deleting row: ", error);
      triggerSucessOrFailMessage("fail", "Could not save changes");
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

  const contextValue = {
    getUsersTimesheetsByDate: getUsersTimesheetsByDate,
    getUsersExpensesByDate: getUsersExpensesByDate,
    getMissingTimesheetsByDate: getMissingTimesheetsByDate,
    getMissingExpensesByDate: getMissingExpensesByDate,
    sendMissingTimesheetReminders: sendMissingTimesheetReminders,
    sendMissingExpenseReminders: sendMissingExpenseReminders,
    saveTimesheetsStatusChanges: saveTimesheetsStatusChanges,
    saveExpensesStatusChanges: saveExpensesStatusChanges,
    triggerUpdate: triggerUpdate,
    triggerSucessOrFailMessage: triggerSucessOrFailMessage,
    successOrFailMessage: successOrFailMessage,
    getAllEmployees: getAllEmployees,
    fetchOvertimeData: fetchOvertimeData,
    getAllProjects: getAllProjects,
    createNewProject: createNewProject,
    deleteProjectById: deleteProjectById,
    editProjectById: editProjectById,
    editUserById: editUserById,
    fetchLaborData: fetchLaborData,
    fetchBereavementData: fetchBereavementData,
    fetchJuryDutyData: fetchJuryDutyData,
    fetchSickData: fetchSickData,
    fetchVacationData: fetchVacationData,
    fetchExpenseReportData: fetchExpenseReportData,
    fetchCategoryEntriesData: fetchCategoryEntriesData,
    getOpenExpenses: getOpenExpenses,
    getOpenTimesheets: getOpenTimesheets,
    fetchOpenExpenseReportData: fetchOpenExpenseReportData,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
}

AdminContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
