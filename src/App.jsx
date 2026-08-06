import { useState } from "react";
import initialEvents from "./data/events.json";
import DaySchedule from "./components/DaySchedule";
import {
  findEventConflicts,
  groupEventsByDay,
} from "./utils/eventUtils";
import "./App.css";

function App() {
  const [events, setEvents] = useState(initialEvents);
  const [conflictMessage, setConflictMessage] = useState("");

  function toggleEvent(eventId) {
    const eventToToggle = events.find((event) => event.id === eventId);

    if (!eventToToggle || eventToToggle.required) {
      return;
    }

    // Selected optional events can always be removed.
    if (eventToToggle.selected) {
      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === eventId
            ? {
                ...event,
                selected: false,
              }
            : event,
        ),
      );

      setConflictMessage("");
      return;
    }

    const conflicts = findEventConflicts(eventToToggle, events);

    if (conflicts.length > 0) {
      const conflictNames = conflicts
        .map((conflict) => conflict.title)
        .join(", ");

      setConflictMessage(
        `"${eventToToggle.title}" overlaps with ${conflictNames}.`,
      );

      return;
    }

    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              selected: true,
            }
          : event,
      ),
    );

    setConflictMessage("");
  }

  const groupedEvents = groupEventsByDay(events);

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <p className="app-header__eyebrow">
            Weekend itinerary planner
          </p>

          <h1>Speedy Scheduler</h1>

          <p className="app-header__description">
            Plan a busy weekend without missing the events that matter most.
          </p>
        </div>

        <div className="app-header__flag" aria-hidden="true">
          🏁
        </div>
      </header>

      {conflictMessage && (
        <div className="conflict-alert" role="alert">
          <div>
            <strong>Schedule conflict</strong>
            <p>{conflictMessage}</p>
          </div>

          <button
            type="button"
            onClick={() => setConflictMessage("")}
            aria-label="Dismiss conflict message"
          >
            ×
          </button>
        </div>
      )}

      <div className="schedule">
        {Object.entries(groupedEvents).map(([day, dayEvents]) => (
          <DaySchedule
            key={day}
            day={day}
            events={dayEvents}
            allEvents={events}
            onToggleEvent={toggleEvent}
          />
        ))}
      </div>
    </main>
  );
}

export default App;