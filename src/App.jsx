import events from "./data/events.json";
import DaySchedule from "./components/DaySchedule";
import { groupEventsByDay } from "./utils/eventUtils";
import "./App.css";

function App() {
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
          <DaySchedule key={day} day={day} events={dayEvents} />
        ))}
      </div>
    </main>
  );
}

export default App;