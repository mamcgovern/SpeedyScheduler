import { useState } from "react";
import initialEvents from "./data/events.json";
import DaySchedule from "./components/DaySchedule";
import {
  findEventConflicts,
  groupEventsByDay,
} from "./utils/eventUtils";
import "./App.css";

const FILTERS = [
  "All",
  "Selected",
  "Required",
  "Race",
  "Q&A",
  "Entertainment",
  "General",
];

function App() {
  const [events, setEvents] = useState(initialEvents);
  const [activeFilter, setActiveFilter] = useState("All");
  const [conflictMessage, setConflictMessage] = useState("");

  function toggleEvent(eventId) {
    const eventToToggle = events.find((event) => event.id === eventId);

    if (!eventToToggle || eventToToggle.required) {
      return;
    }

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
      setConflictMessage(
        `"${eventToToggle.title}" overlaps with ${conflicts
          .map((conflict) => conflict.title)
          .join(", ")}.`,
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

  function filterEvents() {
    switch (activeFilter) {
      case "Selected":
        return events.filter((event) => event.selected);

      case "Required":
        return events.filter((event) => event.required);

      case "All":
        return events;

      default:
        return events.filter(
          (event) => event.category === activeFilter,
        );
    }
  }

  const filteredEvents = filterEvents();
  const groupedEvents = groupEventsByDay(filteredEvents);

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

      <section className="schedule-summary">
        <div>
          <span className="schedule-summary__number">
            {events.filter((event) => event.selected).length}
          </span>
          <span className="schedule-summary__label">
            Scheduled
          </span>
        </div>

        <div>
          <span className="schedule-summary__number">
            {events.filter((event) => event.required).length}
          </span>
          <span className="schedule-summary__label">
            Required
          </span>
        </div>

        <div>
          <span className="schedule-summary__number">
            {events.filter(
              (event) => !event.required && !event.selected,
            ).length}
          </span>
          <span className="schedule-summary__label">
            Optional
          </span>
        </div>
      </section>

      <nav className="filter-bar" aria-label="Schedule filters">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className={
              activeFilter === filter
                ? "filter-button filter-button--active"
                : "filter-button"
            }
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </nav>

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

      {Object.keys(groupedEvents).length > 0 ? (
        <div className="schedule">
          {Object.entries(groupedEvents).map(
            ([day, dayEvents]) => (
              <DaySchedule
                key={day}
                day={day}
                events={dayEvents}
                allEvents={events}
                onToggleEvent={toggleEvent}
              />
            ),
          )}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No events found</h2>
          <p>
            There are no events matching the selected filter.
          </p>
        </div>
      )}
    </main>
  );
}

export default App;