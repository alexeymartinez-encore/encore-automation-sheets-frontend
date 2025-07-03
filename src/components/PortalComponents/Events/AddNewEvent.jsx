import EventInputField from "./EventInputField";

export default function AddNewEvent({ newEvent, setNewEvent, addEvent }) {
  return (
    <div className="flex flex-col md:flex-row justify-around items-center py-2 px-5">
      <EventInputField
        label="Start Date"
        type="date"
        value={newEvent.start}
        onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
        inputStyles="p-2 rounded-md "
      />
      <EventInputField
        label="End Date"
        type="date"
        value={newEvent.end_date}
        onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
        inputStyles="p-2 rounded-md"
      />
      <EventInputField
        label="Calendar Text"
        placeholder="Calendar Text"
        type="text"
        value={newEvent.title}
        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
        inputStyles="p-2 rounded-md"
      />
      <EventInputField
        label="Description"
        placeholder="Description"
        type="text"
        value={newEvent.long_description}
        onChange={(e) =>
          setNewEvent({ ...newEvent, long_description: e.target.value })
        }
        inputStyles="p-2 rounded-md"
      />
      <EventInputField
        label="Background Color"
        type="color"
        value={newEvent.back_color_id}
        onChange={(e) =>
          setNewEvent({ ...newEvent, back_color_id: e.target.value })
        }
        inputStyles="h-7 w-7 rounded-full border-none appearance-none cursor-pointer bg-white"
      />
      <EventInputField
        label="Text Color"
        inputStyles="h-7 w-7 rounded-full border-none appearance-none cursor-pointer bg-white"
        type="color"
        value={newEvent.fore_color_id}
        onChange={(e) =>
          setNewEvent({ ...newEvent, fore_color_id: e.target.value })
        }
      />
    </div>
  );
}
