import {
  useEffect,
  useMemo,
  useState,
} from "react";

import DaySchedule from "../components/DaySchedule";

import {
  formatDayTab,
  getNearestEventDay,
  parseEventDate,
} from "../utils/eventUtils";

function MySchedulePage({
  weekend,
  events,
  onUpdateEventSelection,
}) {
  const selectedEvents =
    useMemo(
      () =>
        events.filter(
          (event) =>
            event.selected,
        ),
      [events],
    );

  const selectedDays =
    useMemo(() => {
      return [
        ...new Set(
          selectedEvents.map(
            (event) =>
              event.day,
          ),
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
    }, [selectedEvents]);

  const [
    activeDay,
    setActiveDay,
  ] = useState(() =>
    getNearestEventDay(
      selectedEvents,
    ),
  );

  useEffect(() => {
    if (
      selectedDays.length === 0
    ) {
      setActiveDay(null);
      return;
    }

    if (
      !activeDay ||
      !selectedDays.includes(
        activeDay,
      )
    ) {
      setActiveDay(
        getNearestEventDay(
          selectedEvents,
        ),
      );
    }
  }, [
    activeDay,
    selectedDays,
    selectedEvents,
  ]);

  const activeDayEvents =
    selectedEvents.filter(
      (event) =>
        event.day === activeDay,
    );

  async function removeEvent(
    eventId,
  ) {
    await onUpdateEventSelection(
      eventId,
      false,
    );
  }

  return (
    <div className="my-schedule-page">
      <header className="page-heading">
        <p className="page-heading__eyebrow">
          {weekend?.title}
        </p>

        <h1>
          My Schedule
        </h1>

        <p>
          View the required events
          and optional activities
          selected for this
          weekend.
        </p>
      </header>

      {selectedEvents.length >
      0 ? (
        <>
          <nav className="day-tabs">
            {selectedDays.map(
              (day) => (
                <button
                  key={day}
                  type="button"
                  className={
                    activeDay ===
                    day
                      ? "day-tab day-tab--active"
                      : "day-tab"
                  }
                  onClick={() =>
                    setActiveDay(
                      day,
                    )
                  }
                >
                  {formatDayTab(
                    day,
                  )}
                </button>
              ),
            )}
          </nav>

          <DaySchedule
            day={activeDay}
            events={
              activeDayEvents
            }
            allEvents={events}
            onToggleEvent={
              removeEvent
            }
          />
        </>
      ) : (
        <section className="empty-state">
          <h2>
            Your schedule is empty
          </h2>

          <p>
            Visit Schedule Builder
            to add optional events.
          </p>
        </section>
      )}
    </div>
  );
}

export default MySchedulePage;