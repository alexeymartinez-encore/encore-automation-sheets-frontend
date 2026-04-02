import { getSessionStorageValue } from "../store/session-store";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

export function fetchUser() {
  const user = {
    user_id: getSessionStorageValue("userId"),
    user_name: getSessionStorageValue("user_name"),
    first_name: getSessionStorageValue("first_name"),
    last_name: getSessionStorageValue("last_name"),
    employee_number: getSessionStorageValue("employee_number"),
    home_phone: getSessionStorageValue("home_phone"),
    cell_phone: getSessionStorageValue("cell_phone"),
    email: getSessionStorageValue("email"),
    role_id: getSessionStorageValue("role_id"),
    manager_id: getSessionStorageValue("manager_id"),
    position: getSessionStorageValue("position"),
    manager_name: getSessionStorageValue("manager_name"),
    allow_overtime: getSessionStorageValue("allow_overtime"),
    is_active: getSessionStorageValue("is_active"),
    is_contractor: getSessionStorageValue("is_contractor"),
  };

  return user; // Return user data
}

export async function authRequest(requestBody, method, authType) {
  const response = await fetch(`${BASE_URL}/auth/${authType}`, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return errorData;
  }

  const data = await response.json();
  return data;
}

export async function fetchTimesheetEntriesData(timesheetId) {
  try {
    const response = await fetch(
      `${BASE_URL}/timesheets/entries/${timesheetId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      console.error("Error during fetching projects:", error);
      return;
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error during fetching projects:", error);
  }
}

export async function deleteTimesheetEntryById(index, row) {
  try {
    const deleteResponse = await fetch(
      `${BASE_URL}/timesheets/delete-timesheet-entry/${row.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!deleteResponse.ok) {
      throw new Error("Error deleting the row from the server");
    }

    const data = deleteResponse.json();

    return data;
  } catch (error) {
    console.error("Error deleting row: ", error);
    return;
  }
}

export async function saveTimesheet(timesheetRequestBody, timesheetId = null) {
  console.log(timesheetRequestBody);
  try {
    const method = "POST";

    // Send request to save the timesheet and entries
    const response = await fetch(`${BASE_URL}/timesheets/save`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(timesheetRequestBody),
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error(`Timesheet already exists. Please choose a new date`);
      } else {
        throw new Error(
          `Error ${timesheetId ? "updating" : "creating"} timesheet`
        );
      }
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function saveExpenseSheet(
  expenseData,
  expenseEntriesData,
  receiptFiles = [],
  expenseId = null
) {
  try {
    const formData = new FormData();
    const expenseDataOb = {
      expenseData,
      expenseEntriesData,
      receiptFiles,
      expenseId,
    };
    console.log(expenseDataOb);

    formData.append("expenseData", JSON.stringify(expenseData));
    formData.append("expenseEntriesData", JSON.stringify(expenseEntriesData));

    receiptFiles.forEach((file) => {
      formData.append("receipts", file);
    });

    const response = await fetch(`${BASE_URL}/expenses/save`, {
      method: "POST",
      credentials: "include", // if using cookies
      body: formData, // no headers; browser sets multipart boundaries
    });

    if (!response.ok) {
      throw new Error(`Error ${expenseId ? "updating" : "creating"} expense`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      `Error during expense ${expenseId ? "update" : "creation"}:`,
      error
    );
    throw error;
  }
}

export async function isAuth() {
  try {
    const res = await fetch(`${BASE_URL}/auth/verify`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      // If the server returned a 401, it's a normal "not logged in" case
      if (res.status === 401) {
        return false; // Not authenticated, but not an error
      }
      throw new Error(`Unexpected response status: ${res.status}`);
    }

    const data = await res.json();
    if (data.message) return false;
    else return true;
  } catch (error) {
    // Only log if it's a real unexpected error
    // if (error.message && !error.message.includes("401")) {
    //   console.error("Auth check failed:", error);
    // }
    return false;
  }
}
