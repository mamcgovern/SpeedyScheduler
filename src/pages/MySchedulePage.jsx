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
    events,
    onUpdateEventSelection,
}) {
    const selectedEvents = useMemo(() => {
        return events.filter(
            (event) => event.selected
        );
    }, [events]);

    const selectedDays = useMemo(() => {
        return [
            ...new Set(
                selectedEvents.map(
                    (event) => event.day
                )
            ),
        ].sort(
            (firstDay, secondDay) =>
                parseEventDate(firstDay) -
                parseEventDate(secondDay)
        );
    }, [selectedEvents]);

    const [activeDay, setActiveDay] =
        useState(() =>
            getNearestEventDay(selectedEvents)
        );

    useEffect(() => {
        if (selectedDays.length === 0) {
            setActiveDay(null);
            return;
        }

        if (
            !activeDay ||
            !selectedDays.includes(activeDay)
        ) {
            setActiveDay(
                getNearestEventDay(
                    selectedEvents
                )
            );
        }
    }, [
        activeDay,
        selectedDays,
        selectedEvents,
    ]);

    const activeDayEvents = useMemo(() => {
        if (!activeDay) {
            return [];
        }

        return selectedEvents.filter(
            (event) =>
                event.day === activeDay
        );
    }, [selectedEvents, activeDay]);

    const requiredCount =
        selectedEvents.filter(
            (event) => event.required
        ).length;

    const optionalCount =
        selectedEvents.filter(
            (event) => !event.required
        ).length;

    async function removeEvent(eventId) {
        await onUpdateEventSelection(
            eventId,
            false
        );
    }

    function selectPreviousDay() {
        const currentIndex =
            selectedDays.indexOf(activeDay);

        if (currentIndex > 0) {
            setActiveDay(
                selectedDays[currentIndex - 1]
            );
        }
    }

    function selectNextDay() {
        const currentIndex =
            selectedDays.indexOf(activeDay);

        if (
            currentIndex >= 0 &&
            currentIndex <
                selectedDays.length - 1
        ) {
            setActiveDay(
                selectedDays[currentIndex + 1]
            );
        }
    }

    const activeDayIndex =
        selectedDays.indexOf(activeDay);

    const hasPreviousDay =
        activeDayIndex > 0;

    const hasNextDay =
        activeDayIndex >= 0 &&
        activeDayIndex <
            selectedDays.length - 1;

    return (
        <div className="my-schedule-page">
            <header className="page-heading">
                <p className="page-heading__eyebrow">
                    Your shared itinerary
                </p>

                <h1>My Schedule</h1>

                <p>
                    Review the required events and
                    optional activities currently
                    included in your shared race
                    weekend schedule.
                </p>
            </header>

            <section className="schedule-summary">
                <div>
                    <span className="schedule-summary__number">
                        {selectedEvents.length}
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

            {selectedEvents.length > 0 ? (
                <>
                    <nav
                        className="day-tabs"
                        aria-label="Choose schedule day"
                    >
                        {selectedDays.map((day) => (
                            <button
                                key={day}
                                type="button"
                                className={
                                    activeDay === day
                                        ? "day-tab day-tab--active"
                                        : "day-tab"
                                }
                                onClick={() =>
                                    setActiveDay(day)
                                }
                                aria-pressed={
                                    activeDay === day
                                }
                            >
                                {formatDayTab(day)}
                            </button>
                        ))}
                    </nav>

                    {activeDayEvents.length > 0 ? (
                        <DaySchedule
                            day={activeDay}
                            events={activeDayEvents}
                            allEvents={events}
                            onToggleEvent={removeEvent}
                        />
                    ) : (
                        <section className="empty-state">
                            <h2>
                                No scheduled events for
                                this day
                            </h2>

                            <p>
                                Select another day or add
                                more events from the
                                scheduler.
                            </p>
                        </section>
                    )}

                    <div className="day-navigation">
                        <button
                            type="button"
                            onClick={selectPreviousDay}
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
                            of {selectedDays.length}
                        </span>

                        <button
                            type="button"
                            onClick={selectNextDay}
                            disabled={!hasNextDay}
                        >
                            Next day →
                        </button>
                    </div>
                </>
            ) : (
                <section className="empty-state">
                    <h2>
                        Your schedule is empty
                    </h2>

                    <p>
                        Visit the scheduler to add
                        optional events to your shared
                        itinerary.
                    </p>
                </section>
            )}
        </div>
    );
}

export default MySchedulePage;