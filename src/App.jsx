import { useState } from "react";
import initialEvents from "./data/events.json";
import DaySchedule from "./components/DaySchedule";
import { groupEventsByDay } from "./utils/eventUtils";
import "./App.css";

function App() {
  const [events, setEvents] = useState(initialEvents);

  function toggleEvent(eventId) {
    setEvents((currentEvents) =>
      currentEvents.map((event) => {
        if (event.id !== eventId || event.required) {
          return event;
        }

        return {
          ...event,
          selected: !event.selected,
        };
      }),
    );
  }

  const groupedEvents = groupEventsByDay(events);

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <p className="app-header__eyebrow">Weekend itinerary planner</p>
          <h1>Speedy Scheduler</h1>
          <p className="app-header__description">
            Plan a busy weekend without missing the events that matter most.
          </p>
        </div>

        <div className="app-header__flag" aria-hidden="true">
          🏁
        </div>
      </header>

      <div className="schedule">
        {Object.entries(groupedEvents).map(([day, dayEvents]) => (
          <DaySchedule
            key={day}
            day={day}
            events={dayEvents}
            onToggleEvent={toggleEvent}
          />
        ))}
      </div>
    </main>
  );
}

export default App;