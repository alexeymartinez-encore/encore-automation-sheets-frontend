import { useContext, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { FaPlus } from "react-icons/fa6";
import { FiChevronDown } from "react-icons/fi";
import { MdDeleteForever } from "react-icons/md";
import { EventContext } from "../../../store/events-context";
import { UserContext } from "../../../store/user-context";
import {
  addDaysToDateOnly,
  endOfMonthDateOnly,
  startOfMonthDateOnly,
  toDateOnly,
} from "../../../util/dateOnly";
import "./custom-calendar.css";

const VIEW_OPTIONS = [
  { key: "day", label: "Day", fcView: "timeGridDay" },
  { key: "week", label: "Week", fcView: "timeGridWeek" },
  { key: "month", label: "Month", fcView: "dayGridMonth" },
  { key: "year", label: "Year", fcView: null },
  { key: "list", label: "List", fcView: "listMonth" },
];

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function monthRange(year, monthIndex) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const start = `${year}-${month}-01`;
  const end = endOfMonthDateOnly(start);
  return { start, end };
}

function overlapsRange(eventObj, rangeStart, rangeEnd) {
  return eventObj.start <= rangeEnd && eventObj.end_date >= rangeStart;
}

function formatEventRange(start, end) {
  if (!start || !end) return "";

  if (start === end) {
    return new Date(`${start}T12:00:00`).toLocaleDateString();
  }

  return `${new Date(`${start}T12:00:00`).toLocaleDateString()} - ${new Date(
    `${end}T12:00:00`,
  ).toLocaleDateString()}`;
}

function sortByLabel(items, getLabel) {
  return [...items].sort((a, b) => {
    const first = getLabel(a).toLowerCase();
    const second = getLabel(b).toLowerCase();
    if (first < second) return -1;
    if (first > second) return 1;
    return 0;
  });
}

function monthTitleFallback(dateOnly) {
  const parsed = new Date(`${dateOnly}T12:00:00`);
  return parsed.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function FullCalendarComponent() {
  const eventCtx = useContext(EventContext);
  const userCtx = useContext(UserContext);

  const calendarRef = useRef(null);
  const isMountedRef = useRef(true);
  const userDropdownRef = useRef(null);

  const today = toDateOnly(new Date());
  const todayYear = Number(today.slice(0, 4));
  const currentUserId = Number(localStorage.getItem("userId")) || null;
  const isAdmin = String(localStorage.getItem("role_id") || "") === "3";
  const canSelectEventOwner = isAdmin;
  const emptyFilters = {
    userId: "",
    eventTypeId: "",
    search: "",
  };

  const [activeView, setActiveView] = useState("month");
  const [calendarTitle, setCalendarTitle] = useState(monthTitleFallback(today));
  const [currentYear, setCurrentYear] = useState(todayYear);

  const [visibleRange, setVisibleRange] = useState({
    start: startOfMonthDateOnly(today),
    end: endOfMonthDateOnly(today),
  });
  const [selectedDate, setSelectedDate] = useState(today);

  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [userSearchText, setUserSearchText] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: currentUserId,
    start: today,
    end_date: today,
    event_type_id: "",
    long_description: "",
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function bootstrapContextData() {
      const [typeData, employeeData] = await Promise.all([
        eventCtx.fetchEventTypes(true),
        userCtx.getAllEmployees(),
      ]);

      if (!isMountedRef.current) return;
      setEventTypes(Array.isArray(typeData) ? typeData : []);
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    }

    bootstrapContextData();
  }, [eventCtx, userCtx, eventCtx.updated]);

  const activeEventTypes = useMemo(
    () => eventTypes.filter((type) => type.is_active),
    [eventTypes],
  );

  const sortedEmployees = useMemo(
    () =>
      sortByLabel(employees, (employee) =>
        `${employee.last_name || ""}, ${employee.first_name || ""}`.trim(),
      ),
    [employees],
  );

  const sortedEventTypes = useMemo(
    () => sortByLabel(activeEventTypes, (type) => type.label || ""),
    [activeEventTypes],
  );

  const currentUserLabel = useMemo(() => {
    const fromEmployees = employees.find(
      (employee) => Number(employee.id) === currentUserId,
    );
    if (fromEmployees) {
      return `${fromEmployees.last_name}, ${fromEmployees.first_name}`;
    }

    const localFirst = String(localStorage.getItem("first_name") || "").trim();
    const localLast = String(localStorage.getItem("last_name") || "").trim();
    if (localFirst || localLast) {
      return [localLast, localFirst].filter(Boolean).join(", ");
    }

    return "Current User";
  }, [employees, currentUserId]);

  const selectedEmployeeLabel = useMemo(() => {
    const targetEmployeeId = Number(formData.employee_id || currentUserId);
    const match = employees.find(
      (employee) => Number(employee.id) === targetEmployeeId,
    );

    if (match) {
      return `${match.last_name}, ${match.first_name}`;
    }

    return currentUserLabel;
  }, [employees, formData.employee_id, currentUserId, currentUserLabel]);

  const filteredUserOptions = useMemo(() => {
    const searchValue = userSearchText.trim().toLowerCase();
    if (!searchValue) return sortedEmployees;

    return sortedEmployees.filter((employee) =>
      `${employee.last_name || ""}, ${employee.first_name || ""}`
        .toLowerCase()
        .includes(searchValue),
    );
  }, [sortedEmployees, userSearchText]);

  useEffect(() => {
    if (!showModal && sortedEventTypes.length > 0) {
      setFormData((prev) => ({
        ...prev,
        event_type_id: prev.event_type_id || String(sortedEventTypes[0].id),
      }));
    }
  }, [sortedEventTypes, showModal]);

  useEffect(() => {
    async function loadEvents() {
      const range =
        activeView === "year"
          ? {
              start: `${currentYear}-01-01`,
              end: `${currentYear}-12-31`,
            }
          : {
              start: visibleRange.start,
              end: visibleRange.end,
            };

      if (!range.start || !range.end) return;

      let employeeIds = [];
      if (appliedFilters.userId) {
        employeeIds = [Number(appliedFilters.userId)];
      }
      const eventTypeIds = appliedFilters.eventTypeId
        ? [Number(appliedFilters.eventTypeId)]
        : [];

      const data = await eventCtx.fetchEventsByRange({
        start: range.start,
        end: range.end,
        employeeIds,
        eventTypeIds,
        search: appliedFilters.search,
      });

      if (!isMountedRef.current) return;
      setEvents(Array.isArray(data) ? data : []);
    }

    loadEvents();
  }, [
    activeView,
    currentYear,
    visibleRange.start,
    visibleRange.end,
    appliedFilters.userId,
    appliedFilters.eventTypeId,
    appliedFilters.search,
    eventCtx,
    eventCtx.updated,
  ]);

  useEffect(() => {
    if (activeView === "year") return;

    const selectedView = VIEW_OPTIONS.find(
      (option) => option.key === activeView,
    );
    if (!selectedView?.fcView) return;

    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(selectedView.fcView);
    }
  }, [activeView]);

  const calendarEvents = useMemo(
    () =>
      events.map((eventObj) => ({
        id: String(eventObj.id),
        title: eventObj.title,
        start: toDateOnly(eventObj.start),
        end: addDaysToDateOnly(eventObj.end_date, 1),
        allDay: true,
        backgroundColor: eventObj.back_color_id || "#1D4ED8",
        borderColor: eventObj.back_color_id || "#1D4ED8",
        textColor: eventObj.fore_color_id || "#FFFFFF",
        extendedProps: {
          ...eventObj,
        },
      })),
    [events],
  );

  const yearCards = useMemo(() => {
    if (activeView !== "year") return [];

    return MONTH_LABELS.map((monthLabel, monthIndex) => {
      const range = monthRange(currentYear, monthIndex);

      const monthEvents = events
        .filter((eventObj) => overlapsRange(eventObj, range.start, range.end))
        .sort((a, b) => {
          if (a.start < b.start) return -1;
          if (a.start > b.start) return 1;
          return a.title.localeCompare(b.title);
        });

      return {
        monthLabel,
        key: `${currentYear}-${monthIndex}`,
        count: monthEvents.length,
        events: monthEvents,
      };
    });
  }, [activeView, currentYear, events]);

  const selectedDateEvents = useMemo(() => {
    return events
      .filter(
        (eventObj) =>
          eventObj.start <= selectedDate && eventObj.end_date >= selectedDate,
      )
      .sort((a, b) => {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return a.title.localeCompare(b.title);
      });
  }, [events, selectedDate]);

  function openCreateModal(dateString = today) {
    setEditingId(null);
    setFormData({
      employee_id:
        Number(appliedFilters.userId || draftFilters.userId) || currentUserId,
      start: dateString,
      end_date: dateString,
      event_type_id: sortedEventTypes[0] ? String(sortedEventTypes[0].id) : "",
      long_description: "",
    });
    setShowModal(true);
  }

  function openEditModal(eventObj) {
    if (!eventObj) return;

    setEditingId(eventObj.id);
    setFormData({
      employee_id: eventObj.employee_id,
      start: toDateOnly(eventObj.start),
      end_date: toDateOnly(eventObj.end_date),
      event_type_id: eventObj.event_type_id
        ? String(eventObj.event_type_id)
        : "",
      long_description: eventObj.long_description || "",
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
  }

  function canEditEvent(eventObj) {
    if (!eventObj) return false;
    return isAdmin || Number(eventObj.employee_id) === currentUserId;
  }

  function handleDatesSet(info) {
    setCalendarTitle(info.view.title || monthTitleFallback(today));
    setVisibleRange({
      start: toDateOnly(info.startStr || info.start),
      end: addDaysToDateOnly(info.endStr || info.end, -1),
    });
  }

  async function handleSaveEvent() {
    if (
      !formData.employee_id ||
      !formData.start ||
      !formData.end_date ||
      !formData.event_type_id
    ) {
      eventCtx.triggerSucessOrFailMessage(
        "fail",
        "Employee, start date, end date, and event type are required.",
      );
      return;
    }

    if (formData.end_date < formData.start) {
      eventCtx.triggerSucessOrFailMessage(
        "fail",
        "End date must be the same day or after start date.",
      );
      return;
    }

    setIsSaving(true);
    const payload = {
      employee_id: Number(formData.employee_id || currentUserId),
      start: formData.start,
      end_date: formData.end_date,
      event_type_id: Number(formData.event_type_id),
      long_description: formData.long_description || "",
    };

    let saved = null;
    if (editingId) {
      saved = await eventCtx.updateEventById(editingId, payload);
    } else {
      saved = await eventCtx.saveEvent(payload);
    }
    setIsSaving(false);

    if (saved) closeModal();
  }

  async function handleDeleteEvent() {
    if (!editingId) return;
    const deleted = await eventCtx.deleteEventById(editingId);
    if (deleted) closeModal();
  }

  function handleApplyFilters(event) {
    event.preventDefault();
    setIsUserDropdownOpen(false);
    setAppliedFilters({
      userId: draftFilters.userId,
      eventTypeId: draftFilters.eventTypeId,
      search: draftFilters.search.trim(),
    });
  }

  function handleResetFilters() {
    const cleared = {
      userId: "",
      eventTypeId: "",
      search: "",
    };
    setUserSearchText("");
    setIsUserDropdownOpen(false);
    setDraftFilters(cleared);
    setAppliedFilters(cleared);
  }

  function handleSelectUser(userId, label = "") {
    setDraftFilters((prev) => ({
      ...prev,
      userId: userId ? String(userId) : "",
    }));
    setUserSearchText(label);
    setIsUserDropdownOpen(false);
  }

  function navigateCalendar(direction) {
    if (activeView === "year") {
      setCurrentYear((prev) => prev + direction);
      return;
    }

    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (direction < 0) calendarApi.prev();
      if (direction > 0) calendarApi.next();
    }
  }

  function goToToday() {
    if (activeView === "year") {
      setCurrentYear(todayYear);
      return;
    }

    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
    }
  }

  const pageTitle = activeView === "year" ? String(currentYear) : calendarTitle;

  return (
    <div className="flex flex-col gap-4 pb-5">
      <div className="bg-white shadow-sm rounded-md p-4 border border-gray-100">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              Calendar
            </p>
            <h2 className="text-3xl font-bold text-slate-800">{pageTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              All employees can view the shared calendar. Event owners can
              manage their own entries, and admins can manage events for any
              employee.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openCreateModal(today)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm transition"
          >
            <FaPlus />
            New Event
          </button>
        </div>

        <form
          onSubmit={handleApplyFilters}
          className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_auto_auto] gap-3 items-end"
        >
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            User
            <div className="relative" ref={userDropdownRef}>
              <input
                type="text"
                value={userSearchText}
                onFocus={() => setIsUserDropdownOpen(true)}
                onChange={(event) => {
                  setUserSearchText(event.target.value);
                  setDraftFilters((prev) => ({
                    ...prev,
                    userId: "",
                  }));
                  setIsUserDropdownOpen(true);
                }}
                placeholder="All employees"
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm bg-white"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 transition"
                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                aria-label="Toggle user options"
              >
                <FiChevronDown className="h-4 w-4" />
              </button>

              {isUserDropdownOpen ? (
                <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-700"
                    onClick={() => handleSelectUser("", "")}
                  >
                    All employees
                  </button>
                  {filteredUserOptions.map((employee) => {
                    const label = `${employee.last_name}, ${employee.first_name}`;
                    return (
                      <button
                        key={employee.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-700"
                        onClick={() => handleSelectUser(employee.id, label)}
                      >
                        {label}
                      </button>
                    );
                  })}
                  {filteredUserOptions.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-500">
                      No matching users
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Event Type
            <select
              value={draftFilters.eventTypeId}
              onChange={(event) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  eventTypeId: event.target.value,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="">All types</option>
              {sortedEventTypes.map((eventType) => (
                <option key={eventType.id} value={eventType.id}>
                  {eventType.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Search Text
            <input
              type="text"
              value={draftFilters.search}
              onChange={(event) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  search: event.target.value,
                }))
              }
              placeholder="Search title or details..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            className="rounded-md bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm transition"
          >
            Search
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            Reset
          </button>
        </form>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="inline-flex items-center rounded-md border border-gray-200 overflow-hidden bg-gray-50">
            {VIEW_OPTIONS.map((viewOption) => (
              <button
                key={viewOption.key}
                type="button"
                onClick={() => setActiveView(viewOption.key)}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeView === viewOption.key
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-white"
                }`}
              >
                {viewOption.label}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={goToToday}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => navigateCalendar(-1)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              aria-label="Previous"
            >
              &lt;
            </button>
            <button
              type="button"
              onClick={() => navigateCalendar(1)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              aria-label="Next"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {activeView === "year" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {yearCards.map((card) => (
            <div
              key={card.key}
              className="bg-white border border-gray-200 rounded-md shadow-sm"
            >
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">
                  {card.monthLabel} {currentYear}
                </h3>
                <span className="rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5">
                  {card.count}
                </span>
              </div>

              <div className="p-3 min-h-[7.5rem] space-y-2">
                {card.events.length > 0 ? (
                  card.events.map((eventObj) => (
                    <button
                      key={eventObj.id}
                      type="button"
                      onClick={() => {
                        setSelectedDate(toDateOnly(eventObj.start));
                        if (canEditEvent(eventObj)) {
                          openEditModal(eventObj);
                        }
                      }}
                      className={`w-full rounded-md px-3 py-2 text-left ${
                        canEditEvent(eventObj)
                          ? "cursor-pointer"
                          : "cursor-default"
                      }`}
                      style={{
                        backgroundColor: eventObj.back_color_id || "#1D4ED8",
                        color: eventObj.fore_color_id || "#FFFFFF",
                      }}
                    >
                      <p className="text-sm font-semibold truncate">
                        {eventObj.title}
                      </p>
                      <p className="text-xs opacity-95">
                        {formatEventRange(eventObj.start, eventObj.end_date)}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No events</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-md p-2 md:p-4 border border-gray-100">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              listPlugin,
              interactionPlugin,
            ]}
            initialView="dayGridMonth"
            initialDate={today}
            headerToolbar={false}
            dayMaxEvents={true}
            events={calendarEvents}
            dateClick={(info) => setSelectedDate(info.dateStr)}
            datesSet={handleDatesSet}
            eventClick={(clickInfo) => {
              const eventObj = clickInfo.event.extendedProps;
              setSelectedDate(
                toDateOnly(clickInfo.event.startStr || clickInfo.event.start),
              );
              if (!canEditEvent(eventObj)) return;
              openEditModal(eventObj);
            }}
            eventDisplay="block"
            height="auto"
          />
        </div>
      )}

      <div className="bg-white shadow-sm rounded-md border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-base font-semibold text-slate-800">
            Events for {selectedDate}
          </h3>
          <button
            type="button"
            onClick={() => openCreateModal(selectedDate)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm transition"
          >
            <FaPlus />
            Add for Day
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Start</th>
                <th className="px-4 py-2">End</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((eventObj) => (
                  <tr
                    key={eventObj.id}
                    className={`border-b border-gray-100 text-gray-700 ${
                      canEditEvent(eventObj)
                        ? "cursor-pointer hover:bg-gray-50"
                        : ""
                    }`}
                    onClick={() => {
                      if (canEditEvent(eventObj)) openEditModal(eventObj);
                    }}
                  >
                    <td className="px-4 py-2">{eventObj.title}</td>
                    <td className="px-4 py-2">
                      <span
                        className="inline-flex rounded px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: eventObj.back_color_id || "#DBEAFE",
                          color: eventObj.fore_color_id || "#1E3A8A",
                        }}
                      >
                        {eventObj.event_type_label || "Other"}
                      </span>
                    </td>
                    <td className="px-4 py-2">{eventObj.start}</td>
                    <td className="px-4 py-2">{eventObj.end_date}</td>
                    <td className="px-4 py-2">
                      {eventObj.Employee
                        ? `${eventObj.Employee.last_name}, ${eventObj.Employee.first_name}`
                        : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {eventObj.long_description || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={6}
                  >
                    No events for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-xl rounded-md bg-white shadow-lg p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {editingId ? "Edit Event" : "Create Event"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
                Employee
                {canSelectEventOwner ? (
                  <select
                    value={String(formData.employee_id || "")}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        employee_id: Number(event.target.value),
                      }))
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="" disabled>
                      Select employee
                    </option>
                    {sortedEmployees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.last_name}, {employee.first_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={selectedEmployeeLabel}
                    readOnly
                    disabled
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                )}
              </label>

              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Start Date
                <input
                  type="date"
                  value={formData.start}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      start: event.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-gray-700">
                End Date
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      end_date: event.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
                Event Type
                <select
                  value={String(formData.event_type_id || "")}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      event_type_id: event.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {sortedEventTypes.map((eventType) => (
                    <option key={eventType.id} value={eventType.id}>
                      {eventType.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
                Optional Details
                <input
                  type="text"
                  value={formData.long_description}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      long_description: event.target.value,
                    }))
                  }
                  placeholder="Example: leaving at 2:00"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={closeModal}
                disabled={isSaving}
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {editingId &&
                canEditEvent({ employee_id: formData.employee_id }) ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md bg-red-500 hover:bg-red-600 px-4 py-2 text-sm text-white transition"
                    onClick={handleDeleteEvent}
                    disabled={isSaving}
                  >
                    <MdDeleteForever />
                    Delete
                  </button>
                ) : null}

                <button
                  type="button"
                  className="rounded-md bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm text-white transition disabled:opacity-60"
                  onClick={handleSaveEvent}
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
