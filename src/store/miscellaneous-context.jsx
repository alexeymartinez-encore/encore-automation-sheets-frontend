import { createContext, useEffect, useState } from "react";
import { isAuth } from "../util/fetching";

// Create the context and provide default values
export const MiscellaneousContext = createContext({
  projects: [],
  customers: [],
  phases: [],
  miscellaneous: [],
  costCodes: [],
  updated: null,
  triggerUpdate: () => {},
});

export default function MiscellaneousContextProvider({ children }) {
  // You can use useState to handle dynamic values if needed

  const [projects, setProjects] = useState([]);
  const [phases, setPhases] = useState([]);
  const [miscellaneous, setMiscellaneous] = useState([]);
  const [costCodes, setCostCodes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [updated, setUpdated] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  useEffect(() => {
    async function init() {
      const authenticated = await isAuth(); // 👈 actually calls isAuth and gets true/false
      if (authenticated) {
        fetchAllProjects();
      }
    }

    async function fetchAllProjects() {
      try {
        const response = await fetch(`${BASE_URL}/miscellaneous/projects`, {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          console.log("Something went wrong");
          return;
        }
        setProjects(data.data);
      } catch (error) {
        console.error("Error during fetching projects:", error);
      }
    }

    init(); // 👈 Call the wrapper async function
  }, [updated]);

  useEffect(() => {
    async function init() {
      const authenticated = await isAuth();
      if (authenticated) {
        fetchAllCustomers();
      }
    }

    async function fetchAllCustomers() {
      try {
        const response = await fetch(`${BASE_URL}/miscellaneous/customers`, {
          headers: {
            // Authorization: "Bearer " + token,
          },
          credentials: "include",
        });

        const data = await response.json();
        // console.log(data);

        if (!response.ok) {
          console.log("Something went wrong");
          return;
        }
        setCustomers(data.data);
      } catch (error) {
        console.error("Error during fetching projects:", error);
      }
    }

    init();
  }, [updated]);

  useEffect(() => {
    async function init() {
      const authenticated = await isAuth();
      if (authenticated) {
        fetchAllPhases();
      }
    }

    async function fetchAllPhases() {
      try {
        const response = await fetch(`${BASE_URL}/miscellaneous/phases`, {
          headers: {
            // Authorization: "Bearer " + token,
          },
          credentials: "include",
        });

        const data = await response.json();
        // console.log(data);

        if (!response.ok) {
          console.log("Something went wrong");
          // setError(data.message || "Login failed. Please try again.");
          // setLoading(false); // Stop loading
          return;
        }
        setPhases(data.data);
      } catch (error) {
        console.error("Error during fetching phases:", error);
        // setError("Something went wrong. Please try again.");
        // setLoading(false); // Stop loading
      }
    }

    init();
  }, [updated]);

  useEffect(() => {
    async function init() {
      const authenticated = await isAuth();
      if (authenticated) {
        fetchAllCostCodes();
      }
    }

    async function fetchAllCostCodes() {
      try {
        const response = await fetch(`${BASE_URL}/miscellaneous/costCodes`, {
          headers: {
            // Authorization: "Bearer " + token,
          },
          credentials: "include",
        });

        const data = await response.json();
        // console.log(data);

        if (!response.ok) {
          console.log("Something went wrong");
          // setError(data.message || "Login failed. Please try again.");
          // setLoading(false); // Stop loading
          return;
        }
        setCostCodes(data.data);
      } catch (error) {
        console.error("Error during fetching phases:", error);
        // setError("Something went wrong. Please try again.");
        // setLoading(false); // Stop loading
      }
    }

    init();
  }, [updated]);

  useEffect(() => {
    async function init() {
      const authenticated = await isAuth();
      if (authenticated) {
        fetchAllCostCodes();
      }
    }

    async function fetchAllCostCodes() {
      try {
        const response = await fetch(`${BASE_URL}/miscellaneous/miscCodes`, {
          headers: {
            // Authorization: "Bearer " + token,
          },
          credentials: "include",
        });

        const data = await response.json();
        // console.log(data);

        if (!response.ok) {
          console.log("Something went wrong");
          // setError(data.message || "Login failed. Please try again.");
          // setLoading(false); // Stop loading
          return;
        }
        setMiscellaneous(data.data);
      } catch (error) {
        console.error("Error during fetching phases:", error);
        // setError("Something went wrong. Please try again.");
        // setLoading(false); // Stop loading
      }
    }

    init();
  }, [updated]);

  function triggerUpdate() {
    setUpdated(true);
  }

  const miscellaneousValues = {
    projects: projects,
    customers: customers,
    phases: phases,
    costCodes: costCodes,
    miscellaneous: miscellaneous,
    triggerUpdate: triggerUpdate,
  };

  return (
    <MiscellaneousContext.Provider value={miscellaneousValues}>
      {children}
    </MiscellaneousContext.Provider>
  );
}
