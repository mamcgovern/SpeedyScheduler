import DaySchedule from "../components/DaySchedule";
import {
    getNearestEventDay,
    groupEventsByDay,
    parseEventDate,
} from "../utils/eventUtils";

function EventsPage({ events }) {
    const racingEvents = events.filter(
        (event) =>
            event.category?.toLowerCase() === "race"
    );

    const groupedEvents = groupEventsByDay(racingEvents);
    const nearestDay = getNearestEventDay(racingEvents);

    const orderedDays = Object.keys(groupedEvents).sort(
        (firstDay, secondDay) => {
            if (firstDay === nearestDay) {
                return -1;
            }

            if (secondDay === nearestDay) {
                return 1;
            }

            return (
                parseEventDate(firstDay) -
                parseEventDate(secondDay)
            );
        }
    );

    return (
        <div className="events-page">
            <header className="page-heading">
                <p className="page-heading__eyebrow">
                    Race Weekend
                </p>

                <h1>Race Schedule</h1>

                <p>
                    Browse every on-track session throughout
                    the weekend, including practice,
                    qualifying, and races.
                </p>
            </header>

            {racingEvents.length > 0 ? (
                <div className="schedule">
                    {orderedDays.map((day) => (
                        <DaySchedule
                            key={day}
                            day={day}
                            events={groupedEvents[day]}
                            allEvents={events}
                            onToggleEvent={() => {}}
                        />
                    ))}
                </div>
            ) : (
                <section className="empty-state">
                    <h2>No race events found</h2>

                    <p>
                        There are currently no events
                        categorized as &quot;Race.&quot;
                    </p>
                </section>
            )}
        </div>
    );
}

export default EventsPage;