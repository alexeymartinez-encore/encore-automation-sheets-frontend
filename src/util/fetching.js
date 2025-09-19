const BASE_URL = import.meta.env.VITE_BASE_URL || "";

export function fetchUser() {
  const user = {
    user_id: localStorage.getItem("token"),
    user_name: localStorage.getItem("user_name"),
    first_name: localStorage.getItem("first_name"),
    last_name: localStorage.getItem("last_name"),
    employee_number: localStorage.getItem("employee_number"),
    home_phone: localStorage.getItem("home_phone"),
    cell_phone: localStorage.getItem("cell_phone"),
    email: localStorage.getItem("email"),
    role_id: localStorage.getItem("role_id"),
    manager_id: localStorage.getItem("manager_id"),
    position: localStorage.getItem("position"),
    manager_name: localStorage.getItem("manager_name"),
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
  // console.log(data);
  if (authType === "login") {
    // Store token in localStorage
    // localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("user_name", data.user.user_name);
    localStorage.setItem("first_name", data.user.first_name);
    localStorage.setItem("last_name", data.user.last_name);
    localStorage.setItem("employee_number", data.user.employee_number);
    localStorage.setItem("home_phone", data.user.home_phone);
    localStorage.setItem("cell_phone", data.user.cell_phone);
    localStorage.setItem("email", data.user.email);
    localStorage.setItem("role_id", data.user.role_id);
    localStorage.setItem("manager_id", data.user.manager_id);
    localStorage.setItem("position", data.user.position);
    localStorage.setItem("manager_name", data.user.manager_name);
    localStorage.setItem("total_employees", data.totalEmployees);
  }
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
