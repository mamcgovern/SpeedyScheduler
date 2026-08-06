import EventCard from "./EventCard";

import {
  findEventConflicts,
  formatEventDate,
  getEventDateTime,
} from "../utils/eventUtils";

function DaySchedule({
  day,
  events,
  allEvents,
  onToggleEvent,
  allowSelection = true,
}) {
  const sortedEvents = [
    ...events,
  ].sort(
    (firstEvent, secondEvent) => {
      const firstTime =
        getEventDateTime(
          firstEvent,
        );

      const secondTime =
        getEventDateTime(
          secondEvent,
        );

      if (!firstTime) {
        return 1;
      }

      if (!secondTime) {
        return -1;
      }

      return (
        firstTime - secondTime
      );
    },
  );

  return (
    <section className="day-schedule">
      <header className="day-schedule__header">
        <p className="day-schedule__eyebrow">
          Daily Schedule
        </p>

        <h2>
          {formatEventDate(day)}
        </h2>

        <p>
          {events.length}{" "}
          {events.length === 1
            ? "event"
            : "events"}
        </p>
      </header>

      <div className="day-schedule__timeline">
        {sortedEvents.map(
          (event) => {
            const conflicts =
              event.selected
                ? []
                : findEventConflicts(
                    event,
                    allEvents,
                  );

            return (
              <EventCard
                key={event.id}
                event={event}
                conflicts={
                  conflicts
                }
                allowSelection={
                  allowSelection
                }
                onToggle={() =>
                  onToggleEvent?.(
                    event.id,
                  )
                }
              />
            );
          },
        )}
      </div>
    </section>
  );
}

export default DaySchedule;