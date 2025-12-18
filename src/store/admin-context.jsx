import { createContext, useState } from "react";

// Create the context
export const AdminContext = createContext({
  users: [],
  getUsersTimesheetsByDate: (date) => {},
  getUsersExpensesByDate: (date) => {},
  saveTimesheetsStatusChanges: (timesheets) => {},
  saveExpensesStatusChanges: (expenses) => {},
  getAllEmployees: () => {},
  getAllProjects: () => {},
  fetchOvertimeData: (date) => {},
  fetchBereavementData: (date) => {},
  fetchJuryDutyData: (date) => {},
  fetchSickData: (date) => {},
  fetchVacationData: (date) => {},
  fetchCategoryEntriesData: () => {},
  fetchExpenseReportData: (date) => {},
  fetchOpenExpenseReportData: () => {},
  successOrFailMessage: null,
  triggerSucessOrFailMessage: () => {},
  triggerUpdate: () => {},
  createNewProject: (projectData) => {},
  deleteProjectById: (id) => {},
  editProjectById: (id) => {},
  editUserById: (id) => {},
  fetchLaborData: () => {},
  getOpenExpenses: () => {},
  getOpenTimesheets: () => {},
});

export default function AdminContextProvider({ children }) {
  const [updated, setUpdated] = useState(false);
  const [successOrFailMessage, setSuccessOrFailMessage] = useState({
    successStatus: "",
    message: "",
  });
  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  async function getUsersTimesheetsByDate(weekEnding) {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/timesheets/${weekEnding}`,
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
      const response = await fetch(
        `${BASE_URL}/admin/timesheets/overtime-report/${date}`,
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
      const response = await fetch(
        `${BASE_URL}/admin/timesheets/labor-report/${date}`,
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
      const response = await fetch(
        `${BASE_URL}/admin/expenses/expense-report/${date}`,
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
      const response = await fetch(`${BASE_URL}/admin/employees/get-all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

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
      const response = await fetch(`${BASE_URL}/admin/projects/get-all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

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
      triggerSucessOrFailMessage(data.internalStatus, `${data.message}`);
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
      // console.error("Error Updating event: ", error);
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
      // console.error("Error Updating event: ", error);
      triggerUpdate();
      triggerSucessOrFailMessage("fail", "Edit Event Failed");
      return;
    }
  }
  async function getUsersExpensesByDate(dateStart) {
    try {
      const response = await fetch(`${BASE_URL}/admin/expenses/${dateStart}`, {
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
      console.error("Error deleting row: ", error);
      return;
    }
  }

  async function getOpenExpenses(date) {
    try {
      const response = await fetch(`${BASE_URL}/admin/open-expenses/${date}`, {
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

  async function saveTimesheetsStatusChanges(timesheetData) {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/timesheets/status-change`,
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
      const response = await fetch(`${BASE_URL}/admin/expenses/status-change`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(expenseData),
      });

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
