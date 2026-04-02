import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import EventTypesManagement from "../EventTypes/EventTypesManagement";
import EventCalendarReport from "../Reports/EventCalendarReport";

const TAB_CONFIG = {
  types: {
    label: "Event Types",
    title: "Configure event categories",
    description:
      "Create, edit, and archive the event types that drive the employee calendar.",
  },
  reports: {
    label: "Event Reports",
    title: "Audit and export event activity",
    description:
      "Filter calendar activity by date, employee, and event type, then export the result set.",
  },
};

const DEFAULT_TAB = "types";

export default function EventConfiguration() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = TAB_CONFIG[requestedTab] ? requestedTab : DEFAULT_TAB;
  const currentTab = TAB_CONFIG[activeTab];

  useEffect(() => {
    if (!TAB_CONFIG[requestedTab]) {
      setSearchParams({ tab: DEFAULT_TAB }, { replace: true });
    }
  }, [requestedTab, setSearchParams]);

  function handleTabChange(nextTab) {
    setSearchParams({ tab: nextTab }, { replace: true });
  }

  return (
    <div className="my-5 flex flex-col gap-6">
      <section className="rounded-md bg-white p-2 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row">
          {Object.entries(TAB_CONFIG).map(([tabKey, tab]) => {
            const isActive = tabKey === activeTab;
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => handleTabChange(tabKey)}
                className={`flex-1 rounded-md px-4 py-3 text-left transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-transparent text-gray-700 hover:bg-gray-100"
                }`}
              >
                <p className="text-sm font-semibold">{tab.label}</p>
                <p
                  className={`mt-1 text-xs leading-5 ${
                    isActive ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {tab.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-md border border-gray-200 bg-gray-50/70 p-4">
        <h3 className="text-base font-semibold text-gray-900">
          {currentTab.title}
        </h3>
        <p className="mt-1 text-sm text-gray-600">{currentTab.description}</p>
      </section>

      {activeTab === "types" ? (
        <EventTypesManagement isEmbedded />
      ) : (
        <EventCalendarReport isEmbedded />
      )}
    </div>
  );
}
