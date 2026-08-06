import {
    useMemo,
    useState,
} from "react";

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

function SchedulerPage({
    events,
    onUpdateEventSelection,
}) {
    const [activeFilter, setActiveFilter] =
        useState("All");

    const [conflictMessage, setConflictMessage] =
        useState("");

    /*
     * Build the sorted list of event dates.
     */
    const eventDays = useMemo(() => {
        return [
            ...new Set(
                events.map(
                    (event) => event.day
                )
            ),
        ].sort(
            (firstDay, secondDay) =>
                parseEventDate(firstDay) -
                parseEventDate(secondDay)
        );
    }, [events]);

    /*
     * Open the nearest upcoming event date by default.
     */
    const [activeDay, setActiveDay] =
        useState(() =>
            getNearestEventDay(events)
        );

    function eventMatchesFilter(event) {
        switch (activeFilter) {
            case "Selected":
                return event.selected;

            case "Required":
                return event.required;

            case "All":
                return true;

            default:
                return (
                    event.category ===
                    activeFilter
                );
        }
    }

    /*
     * Only display events for the active day and filter.
     */
    const visibleEvents = events.filter(
        (event) =>
            event.day === activeDay &&
            eventMatchesFilter(event)
    );

    async function toggleEvent(eventId) {
        const eventToToggle = events.find(
            (event) =>
                event.id === eventId
        );

        if (!eventToToggle) {
            return;
        }

        /*
         * Required events cannot be removed.
         */
        if (eventToToggle.required) {
            return;
        }

        /*
         * Selected optional events can always
         * be removed.
         */
        if (eventToToggle.selected) {
            await onUpdateEventSelection(
                eventId,
                false
            );

            setConflictMessage("");
            return;
        }

        /*
         * Check the optional event against the
         * currently selected schedule.
         */
        const conflicts = findEventConflicts(
            eventToToggle,
            events
        );

        if (conflicts.length > 0) {
            const conflictNames = conflicts
                .map(
                    (conflict) =>
                        conflict.title
                )
                .join(", ");

            setConflictMessage(
                `"${eventToToggle.title}" overlaps with ${conflictNames}.`
            );

            return;
        }

        await onUpdateEventSelection(
            eventId,
            true
        );

        setConflictMessage("");
    }

    function selectDay(day) {
        setActiveDay(day);
        setConflictMessage("");
    }

    function selectPreviousDay() {
        const currentIndex =
            eventDays.indexOf(activeDay);

        if (currentIndex > 0) {
            selectDay(
                eventDays[currentIndex - 1]
            );
        }
    }

    function selectNextDay() {
        const currentIndex =
            eventDays.indexOf(activeDay);

        if (
            currentIndex >= 0 &&
            currentIndex <
                eventDays.length - 1
        ) {
            selectDay(
                eventDays[currentIndex + 1]
            );
        }
    }

    const activeDayIndex =
        eventDays.indexOf(activeDay);

    const hasPreviousDay =
        activeDayIndex > 0;

    const hasNextDay =
        activeDayIndex >= 0 &&
        activeDayIndex <
            eventDays.length - 1;

    const scheduledCount = events.filter(
        (event) => event.selected
    ).length;

    const requiredCount = events.filter(
        (event) => event.required
    ).length;

    const optionalCount = events.filter(
        (event) =>
            !event.required &&
            !event.selected
    ).length;

    return (
        <div className="scheduler-page">
            <header className="page-heading">
                <p className="page-heading__eyebrow">
                    Plan your weekend
                </p>

                <h1>Event Scheduler</h1>

                <p>
                    Browse the weekend events and
                    add optional activities to your
                    shared schedule.
                </p>
            </header>

            <section className="schedule-summary">
                <div>
                    <span className="schedule-summary__number">
                        {scheduledCount}
                    </span>

                    <span className="schedule-summary__label">
                        Scheduled
                    </span>
                </div>

                <div>
                    <span className="schedule-summary__number">
                        {requiredCount}
                    </span>

                    <span className="schedule-summary__label">
                        Required
                    </span>
                </div>

                <div>
                    <span className="schedule-summary__number">
                        {optionalCount}
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
                        onClick={() =>
                            selectDay(day)
                        }
                        aria-pressed={
                            activeDay === day
                        }
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
                            activeFilter ===
                            filter
                                ? "filter-button filter-button--active"
                                : "filter-button"
                        }
                        onClick={() => {
                            setActiveFilter(
                                filter
                            );

                            setConflictMessage(
                                ""
                            );
                        }}
                    >
                        {filter}
                    </button>
                ))}
            </nav>

            {conflictMessage && (
                <div
                    className="conflict-alert"
                    role="alert"
                >
                    <div>
                        <strong>
                            Schedule conflict
                        </strong>

                        <p>
                            {conflictMessage}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setConflictMessage(
                                ""
                            )
                        }
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
                    onToggleEvent={
                        toggleEvent
                    }
                />
            ) : (
                <section className="empty-state">
                    <h2>
                        No events found
                    </h2>

                    <p>
                        There are no{" "}
                        {activeFilter.toLowerCase()}{" "}
                        events scheduled for this
                        day.
                    </p>
                </section>
            )}

            <div className="day-navigation">
                <button
                    type="button"
                    onClick={
                        selectPreviousDay
                    }
                    disabled={
                        !hasPreviousDay
                    }
                >
                    ← Previous day
                </button>

                <span>
                    Day{" "}
                    {activeDayIndex >= 0
                        ? activeDayIndex + 1
                        : 0}{" "}
                    of {eventDays.length}
                </span>

                <button
                    type="button"
                    onClick={selectNextDay}
                    disabled={!hasNextDay}
                >
                    Next day →
                </button>
            </div>
        </div>
    );
}

export default SchedulerPage;