import EventCard from "./EventCard";
import { formatEventDate } from "../utils/eventUtils";

function DaySchedule({ day, events, onToggleEvent }) {
  return (
    <section className="day-schedule">
      <header className="day-schedule__header">
        <p className="day-schedule__eyebrow">Daily Schedule</p>
        <h2>{formatEventDate(day)}</h2>
        <p>
          {events.length} {events.length === 1 ? "event" : "events"}
        </p>
      </header>

      <div className="day-schedule__timeline">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onToggle={() => onToggleEvent(event.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default DaySchedule;