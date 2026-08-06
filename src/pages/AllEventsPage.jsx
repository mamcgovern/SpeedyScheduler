import {
  useMemo,
} from "react";

import DaySchedule from "../components/DaySchedule";

import {
  parseEventDate,
} from "../utils/eventUtils";

function AllEventsPage({
  weekend,
  events,
}) {
  const eventDays =
    useMemo(() => {
      return [
        ...new Set(
          events
            .map(
              (event) =>
                event.day,
            )
            .filter(Boolean),
        ),
      ].sort(
        (
          firstDay,
          secondDay,
        ) =>
          parseEventDate(
            firstDay,
          ) -
          parseEventDate(
            secondDay,
          ),
      );
    }, [events]);

  return (
    <div className="all-events-page">
      <header className="page-heading">
        <p className="page-heading__eyebrow">
          {weekend?.title}
        </p>

        <h1>All Events</h1>

        <p>
          View every event planned
          for this weekend,
          regardless of whether it
          is selected.
        </p>
      </header>

      {events.length > 0 ? (
        <div className="schedule">
          {eventDays.map(
            (day) => (
              <DaySchedule
                key={day}
                day={day}
                events={events.filter(
                  (event) =>
                    event.day ===
                    day,
                )}
                allEvents={events}
                allowSelection={
                  false
                }
              />
            ),
          )}
        </div>
      ) : (
        <section className="empty-state">
          <h2>
            No events yet
          </h2>

          <p>
            Add events from Manage
            Weekends.
          </p>
        </section>
      )}
    </div>
  );
}

export default AllEventsPage;