import EventInputField from "./EventInputField";

export default function AddNewEvent({ newEvent, setNewEvent, addEvent }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2  py-2 px-5 w-full gap-5">
      <div>
        <EventInputField
          label="Start Date"
          type="date"
          value={newEvent.start}
          onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
          inputStyles="py-3 px-2 rounded-md w-full"
        />
        <EventInputField
          label="End Date"
          type="date"
          value={newEvent.end_date}
          onChange={(e) =>
            setNewEvent({ ...newEvent, end_date: e.target.value })
          }
          inputStyles="py-3 px-2 rounded-md w-full"
        />
        <EventInputField
          label="Calendar Text"
          placeholder="Calendar Text"
          type="text"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          inputStyles="py-3 px-2 rounded-md  w-full"
        />
      </div>
      <div>
        <EventInputField
          label="Description"
          placeholder="Description"
          type="text"
          value={newEvent.long_description}
          onChange={(e) =>
            setNewEvent({ ...newEvent, long_description: e.target.value })
          }
          inputStyles="py-3 px-2 rounded-md  w-full"
        />
        <div className="flex justify-between md:justify-start w-full gap-10">
          <div className="flex flex-col justify-center items-start ">
            <label className="py-2 text-black">Background Color</label>
            <input
              className={`text-black text-center bg-transparent h-10 w-24`}
              // placeholder="Background Color"
              type="color"
              value={newEvent.back_color_id}
              onChange={(e) =>
                setNewEvent({ ...newEvent, back_color_id: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col justify-center items-start ">
            <label className="py-2 text-black">Text Color</label>
            <input
              className={`text-black text-center  bg-transparent h-10 w-24`}
              // placeholder="Background Color"
              type="color"
              value={newEvent.fore_color_id}
              onChange={(e) =>
                setNewEvent({ ...newEvent, fore_color_id: e.target.value })
              }
            />
          </div>
          {/* <EventInputField
            label="Background Color"
            type="color"
            value={newEvent.back_color_id}
            onChange={(e) =>
              setNewEvent({ ...newEvent, back_color_id: e.target.value })
            }
            // className={`w-6 h-6 rounded-full ${color} flex items-center justify-center ${selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
            inputStyles={`w-6 h-6 rounded-full flex items-center justify-center`}
          />
          <EventInputField
            label="Text Color"
            inputStyles="h-6 w-6 rounded-full border-none appearance-none cursor-pointer bg-white"
            type="color"
            value={newEvent.fore_color_id}
            onChange={(e) =>
              setNewEvent({ ...newEvent, fore_color_id: e.target.value })
            }
          /> */}
        </div>
      </div>
    </div>
  );
}
