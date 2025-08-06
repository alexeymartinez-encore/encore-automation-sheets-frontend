import { createContext, useState } from "react";

// Create the context
export const UserContext = createContext({
  getAllEmployees: () => {},
});

export default function UserContextProvider({ children }) {
  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  async function getAllEmployees() {
    try {
      const response = await fetch(`${BASE_URL}/user/all-employees`, {
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

  const contextValue = {
    getAllEmployees: getAllEmployees,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
