import { useMemo, useState } from "react";
import initialEvents from "../data/events.json";
import DaySchedule from "../components/DaySchedule";
import {
    findEventConflicts,
    formatDayTab,
    getNearestEventDay,
    parseEventDate,
} from "../utils/eventUtils";

const FILTERS = [
    "All",
    "Selected",
    "Required",
    "Race",
    "Q&A",
    "Entertainment",
    "General",
];

function SchedulerPage() {
    const [events, setEvents] = useState(initialEvents);
    const [activeFilter, setActiveFilter] = useState("All");
    const [conflictMessage, setConflictMessage] = useState("");

    const eventDays = useMemo(() => {
        return [...new Set(events.map((event) => event.day))].sort(
            (firstDay, secondDay) =>
                parseEventDate(firstDay) - parseEventDate(secondDay),
        );
    }, [events]);

    const [activeDay, setActiveDay] = useState(() =>
        getNearestEventDay(initialEvents),
    );

    function toggleEvent(eventId) {
        const eventToToggle = events.find(
            (event) => event.id === eventId,
        );

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

        const conflicts = findEventConflicts(
            eventToToggle,
            events,
        );

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

    function eventMatchesFilter(event) {
        switch (activeFilter) {
            case "Selected":
                return event.selected;

            case "Required":
                return event.required;

            case "All":
                return true;

            default:
                return event.category === activeFilter;
        }
    }

    const visibleEvents = events.filter(
        (event) =>
            event.day === activeDay &&
            eventMatchesFilter(event),
    );

    function selectPreviousDay() {
        const currentIndex = eventDays.indexOf(activeDay);

        if (currentIndex > 0) {
            setActiveDay(eventDays[currentIndex - 1]);
            setConflictMessage("");
        }
    }

    function selectNextDay() {
        const currentIndex = eventDays.indexOf(activeDay);

        if (currentIndex < eventDays.length - 1) {
            setActiveDay(eventDays[currentIndex + 1]);
            setConflictMessage("");
        }
    }

    const activeDayIndex = eventDays.indexOf(activeDay);
    const hasPreviousDay = activeDayIndex > 0;
    const hasNextDay =
        activeDayIndex < eventDays.length - 1;

    return (
        <main className="app">

            <header className="page-heading">
                <p className="page-heading__eyebrow">Plan your weekend</p>
                <h1>Event Scheduler</h1>
                <p>
                    Build your itinerary without missing the events that matter most.
                </p>
            </header>
            
            <section className="schedule-summary">
                <div>
                    <span className="schedule-summary__number">
                        {
                            events.filter((event) => event.selected)
                                .length
                        }
                    </span>

                    <span className="schedule-summary__label">
                        Scheduled
                    </span>
                </div>

                <div>
                    <span className="schedule-summary__number">
                        {
                            events.filter((event) => event.required)
                                .length
                        }
                    </span>

                    <span className="schedule-summary__label">
                        Required
                    </span>
                </div>

                <div>
                    <span className="schedule-summary__number">
                        {
                            events.filter(
                                (event) =>
                                    !event.required && !event.selected,
                            ).length
                        }
                    </span>

                    <span className="schedule-summary__label">
                        Optional
                    </span>
                </div>
            </section>

            <nav
                className="day-tabs"
                aria-label="Choose schedule day"
            >
                {eventDays.map((day) => (
                    <button
                        key={day}
                        type="button"
                        className={
                            activeDay === day
                                ? "day-tab day-tab--active"
                                : "day-tab"
                        }
                        onClick={() => {
                            setActiveDay(day);
                            setConflictMessage("");
                        }}
                        aria-pressed={activeDay === day}
                    >
                        {formatDayTab(day)}
                    </button>
                ))}
            </nav>

            <nav
                className="filter-bar"
                aria-label="Filter events"
            >
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

            {visibleEvents.length > 0 ? (
                <DaySchedule
                    day={activeDay}
                    events={visibleEvents}
                    allEvents={events}
                    onToggleEvent={toggleEvent}
                />
            ) : (
                <div className="empty-state">
                    <h2>No events found</h2>
                    <p>
                        There are no {activeFilter.toLowerCase()} events
                        scheduled for this day.
                    </p>
                </div>
            )}

            <div className="day-navigation">
                <button
                    type="button"
                    onClick={selectPreviousDay}
                    disabled={!hasPreviousDay}
                >
                    ← Previous day
                </button>

                <span>
                    Day {activeDayIndex + 1} of {eventDays.length}
                </span>

                <button
                    type="button"
                    onClick={selectNextDay}
                    disabled={!hasNextDay}
                >
                    Next day →
                </button>
            </div>
        </main>
    );
}

export default SchedulerPage;