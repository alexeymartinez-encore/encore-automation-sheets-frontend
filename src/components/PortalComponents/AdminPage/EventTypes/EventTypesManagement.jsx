import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { EventContext } from "../../../../store/events-context";
import "./EventTypesManagement.css";

const DEFAULT_TYPE_FORM = {
  label: "",
  key: "",
  back_color: "#1D4ED8",
  fore_color: "#FFFFFF",
  is_holiday: false,
  is_active: true,
};

function sortTypes(eventTypes) {
  return [...eventTypes].sort((a, b) => {
    const first = String(a.label || "").toLowerCase();
    const second = String(b.label || "").toLowerCase();
    if (first < second) return -1;
    if (first > second) return 1;
    return 0;
  });
}

export default function EventTypesManagement({ isEmbedded = false }) {
  const eventCtx = useContext(EventContext);

  const [eventTypes, setEventTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_TYPE_FORM);

  const loadEventTypes = useCallback(async () => {
    setIsLoading(true);
    const data = await eventCtx.fetchEventTypes(true);
    setEventTypes(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }, [eventCtx]);

  useEffect(() => {
    loadEventTypes();
  }, [loadEventTypes, eventCtx.updated]);

  const sortedTypes = useMemo(() => sortTypes(eventTypes), [eventTypes]);

  function resetForm() {
    setEditingId(null);
    setFormData(DEFAULT_TYPE_FORM);
  }

  function editType(eventType) {
    setEditingId(eventType.id);
    setFormData({
      label: eventType.label || "",
      key: eventType.key || "",
      back_color: eventType.back_color || "#1D4ED8",
      fore_color: eventType.fore_color || "#FFFFFF",
      is_holiday: Boolean(eventType.is_holiday),
      is_active: Boolean(eventType.is_active),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);

    const payload = {
      label: formData.label.trim(),
      key: formData.key.trim(),
      back_color: formData.back_color,
      fore_color: formData.fore_color,
      is_holiday: formData.is_holiday,
      is_active: formData.is_active,
    };

    let success = null;
    if (editingId) {
      success = await eventCtx.updateEventTypeById(editingId, payload);
    } else {
      success = await eventCtx.createEventType(payload);
    }

    setIsSaving(false);

    if (success) {
      resetForm();
      loadEventTypes();
    }
  }

  async function archiveType(eventTypeId) {
    const wasArchived = await eventCtx.deleteEventTypeById(eventTypeId);
    if (wasArchived) {
      loadEventTypes();
    }
  }

  async function toggleTypeActive(eventType) {
    const updated = await eventCtx.updateEventTypeById(eventType.id, {
      is_active: !eventType.is_active,
    });
    if (updated) {
      loadEventTypes();
    }
  }

  return (
    <div className={`${isEmbedded ? "" : "my-5 "}flex flex-col gap-6`}>
      {!isEmbedded ? (
        <div className="bg-white shadow-sm rounded-md p-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Event Type Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Define the predefined event types, colors, and holiday behavior
            used by the calendar and reports.
          </p>
        </div>
      ) : null}

      <div className="bg-white shadow-sm rounded-md p-4">
        <h3 className="text-base font-semibold text-gray-800 mb-3">
          {editingId ? "Edit Event Type" : "Create Event Type"}
        </h3>
        <form
          className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
          onSubmit={handleSubmit}
        >
          <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
            Label
            <input
              type="text"
              value={formData.label}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, label: event.target.value }))
              }
              required
              placeholder="Vacation (Morning)"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-1">
            Key (optional)
            <input
              type="text"
              value={formData.key}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, key: event.target.value }))
              }
              placeholder="vacation-morning"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-1">
            Background
            <input
              type="color"
              value={formData.back_color}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  back_color: event.target.value,
                }))
              }
              className="circle-color-input"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-1">
            Text Color
            <input
              type="color"
              value={formData.fore_color}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  fore_color: event.target.value,
                }))
              }
              className="circle-color-input"
            />
          </label>

          <div className="flex flex-col gap-2 text-sm text-gray-700 md:col-span-1">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_holiday}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_holiday: event.target.checked,
                  }))
                }
              />
              Holiday Type
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_active: event.target.checked,
                  }))
                }
              />
              Active
            </label>
          </div>

          <div className="md:col-span-6 flex items-center gap-2">
            <button
              type="submit"
              className="rounded-md bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm transition disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingId
                ? "Save Type Changes"
                : "Create Type"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="bg-white shadow-sm rounded-md p-4">
        <h3 className="text-base font-semibold text-gray-800 mb-3">
          Existing Event Types
        </h3>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading event types...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2 pr-3">Preview</th>
                  <th className="py-2 pr-3">Label</th>
                  <th className="py-2 pr-3">Background</th>
                  <th className="py-2 pr-3">Text</th>
                  <th className="py-2 pr-3">Key</th>
                  <th className="py-2 pr-3">Holiday</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTypes.length > 0 ? (
                  sortedTypes.map((eventType) => (
                    <tr
                      key={eventType.id}
                      className="border-b border-gray-100 text-gray-700 align-top"
                    >
                      <td className="py-2 pr-3">
                        <span
                          className="inline-flex rounded px-2 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: eventType.back_color,
                            color: eventType.fore_color,
                          }}
                        >
                          {eventType.label}
                        </span>
                      </td>
                      <td className="py-2 pr-3">{eventType.label}</td>
                      <td className="py-2 pr-3">
                        <span
                          className="color-swatch-circle"
                          style={{
                            backgroundColor: eventType.back_color,
                          }}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className="color-swatch-circle"
                          style={{
                            backgroundColor: eventType.fore_color,
                          }}
                        />
                      </td>
                      <td className="py-2 pr-3">{eventType.key}</td>
                      <td className="py-2 pr-3">
                        {eventType.is_holiday ? "Yes" : "No"}
                      </td>
                      <td className="py-2 pr-3">
                        {eventType.is_active ? "Active" : "Archived"}
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 transition"
                            onClick={() => editType(eventType)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 transition"
                            onClick={() => toggleTypeActive(eventType)}
                          >
                            {eventType.is_active ? "Archive" : "Activate"}
                          </button>
                          {eventType.is_active ? (
                            <button
                              type="button"
                              className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100 transition"
                              onClick={() => archiveType(eventType.id)}
                            >
                              Soft Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 text-center text-gray-500" colSpan={8}>
                      No event types found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

EventTypesManagement.propTypes = {
  isEmbedded: PropTypes.bool,
};
