import { createContext, useState } from "react";
import { authRequest } from "../util/fetching";

// Create the context
export const AuthContext = createContext({
  login: () => {},
  signup: () => {},
});

export default function AuthContextProvider({ children }) {
  async function login(credentials) {
    if (!credentials) {
      throw new Error("Something Went Wrong");
    }

    const requestBody = {
      user_name: credentials.user_name,
      password: credentials.password,
    };

    try {
      const data = await authRequest(requestBody, "POST", "login");
      // console.log(data, "USER CONTEXT");
      if (data.status === 200) return true; // Login successful
    } catch (error) {
      console.error("Something went wrong. Please try again.");
      return false; // Login failed
    }
  }

  async function signup(credentials) {
    if (!credentials) {
      throw new Error("Something Went Wrong");
    }

    const requestBody = {
      email: credentials.email,
      password: credentials.create_password,
      confirmed_password: credentials.confirm_password,
      first_name: credentials.first_name,
      last_name: credentials.last_name,
      employee_number: +credentials.employee_number,
      position: credentials.position,
      cell_phone: credentials.cell_phone,
      home_phone: credentials.home_phone,
      role_id: credentials.role_id,
      manager_id: credentials.manager_id,
      is_contractor: String(credentials.is_contractor).toLowerCase() === "true",
      is_active: String(credentials.is_active).toLowerCase() === "true",
    };

    try {
      const data = await authRequest(requestBody, "PUT", "signup");
      // console.log("Signup Successful: ", data);
      return data;
    } catch (err) {
      console.error(err);
    }
  }

  const contextValue = {
    login,
    signup,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
