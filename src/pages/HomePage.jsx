import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router";

import WeatherCard from "../components/WeatherCard";

import {
  formatEventDateWithYear,
  formatTimeRange,
  formatWeekendDateRange,
  getCountdownText,
  getNextScheduledEvent,
} from "../utils/eventUtils";

function HomePage({
  weekend,
  events,
}) {
  const [
    currentTime,
    setCurrentTime,
  ] = useState(
    () => new Date(),
  );

  useEffect(() => {
    const timer =
      window.setInterval(
        () => {
          setCurrentTime(
            new Date(),
          );
        },
        30000,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, []);

  const nextEvent =
    useMemo(
      () =>
        getNextScheduledEvent(
          events,
          currentTime,
        ),
      [
        events,
        currentTime,
      ],
    );

  const selectedCount =
    events.filter(
      (event) =>
        event.selected,
    ).length;

  const countdownText =
    nextEvent
      ? getCountdownText(
          nextEvent.dateTime,
          currentTime,
        )
      : "";

  const happeningNow =
    nextEvent &&
    nextEvent.dateTime <=
      currentTime &&
    nextEvent.endDateTime &&
    nextEvent.endDateTime >
      currentTime;

  const eventDates = [
    ...new Set(
      events
        .map(
          (event) =>
            event.day,
        )
        .filter(Boolean),
    ),
  ];

  if (!weekend) {
    return (
      <section className="empty-state">
        <h1>
          No weekend selected
        </h1>

        <p>
          Create or select a
          weekend to begin.
        </p>
      </section>
    );
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">
            {formatWeekendDateRange(
              weekend.startDate,
              weekend.endDate,
            )}
          </p>

          <h1>
            {weekend.title}
          </h1>

          {weekend.subtitle && (
            <p className="home-hero__description">
              {weekend.subtitle}
            </p>
          )}

          {(weekend.locationName ||
            weekend.locationAddress) && (
            <p className="home-hero__location">
              📍{" "}
              {[
                weekend.locationName,
                weekend.locationAddress,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}

          <div className="home-hero__actions">
            <Link
              to="/scheduler"
              className="home-button home-button--primary"
            >
              Build Schedule
            </Link>

            <Link
              to="/my-schedule"
              className="home-button home-button--secondary"
            >
              View Schedule
            </Link>
          </div>
        </div>

        <div className="home-hero__logo-wrapper">
          <span className="home-hero__placeholder-logo">
            📅
          </span>
        </div>
      </section>

      <section className="home-grid">
        <article className="next-event-card">
          <div className="next-event-card__header">
            <div>
              <p className="home-card__eyebrow">
                Up next
              </p>

              <h2>
                Next Scheduled Event
              </h2>
            </div>

            <span className="next-event-card__flag">
              📍
            </span>
          </div>

          {nextEvent ? (
            <div className="next-event-card__body">
              <div className="next-event-card__countdown">
                <span>
                  {happeningNow
                    ? "Happening now"
                    : "Starts in"}
                </span>

                <strong>
                  {happeningNow
                    ? "Now"
                    : countdownText}
                </strong>
              </div>

              <span className="next-event-card__category">
                {nextEvent.category ||
                  "General"}
              </span>

              <h3>
                {nextEvent.title}
              </h3>

              <p className="next-event-card__date">
                {formatEventDateWithYear(
                  nextEvent.day,
                )}
              </p>

              <p className="next-event-card__time">
                {formatTimeRange(
                  nextEvent.start,
                  nextEvent.end,
                )}
              </p>

              {nextEvent.location && (
                <p className="next-event-card__location">
                  📍{" "}
                  {
                    nextEvent.location
                  }
                </p>
              )}

              <Link
                to="/my-schedule"
                className="next-event-card__link"
              >
                View full schedule →
              </Link>
            </div>
          ) : (
            <div className="next-event-card__empty">
              <h3>
                No upcoming events
              </h3>

              <p>
                There are no
                remaining selected
                events.
              </p>

              <Link
                to="/scheduler"
                className="next-event-card__link"
              >
                Browse events →
              </Link>
            </div>
          )}
        </article>

        <article className="schedule-status-card">
          <p className="home-card__eyebrow">
            This weekend
          </p>

          <span className="schedule-status-card__number">
            {selectedCount}
          </span>

          <h2>
            Events Scheduled
          </h2>

          <p>
            Required events and
            optional activities
            selected for this
            weekend.
          </p>

          <Link to="/my-schedule">
            Review schedule →
          </Link>
        </article>
      </section>

      {weekend.latitude != null &&
        weekend.longitude !=
          null && (
          <WeatherCard
            latitude={
              weekend.latitude
            }
            longitude={
              weekend.longitude
            }
            locationName={
              weekend.locationName
            }
            eventDates={
              eventDates
            }
          />
        )}

      <section className="quick-links-section">
        <div className="quick-links-section__heading">
          <p className="home-card__eyebrow">
            Helpful links
          </p>

          <h2>
            Weekend Resources
          </h2>
        </div>

        <div className="quick-links">
          <Link
            to="/scheduler"
            className="quick-link-card"
          >
            <span>📅</span>

            <div>
              <h3>
                Schedule Builder
              </h3>

              <p>
                Browse and choose
                optional events.
              </p>
            </div>
          </Link>

          <Link
            to="/my-schedule"
            className="quick-link-card"
          >
            <span>✅</span>

            <div>
              <h3>
                My Schedule
              </h3>

              <p>
                View selected
                events.
              </p>
            </div>
          </Link>

          <Link
            to="/events"
            className="quick-link-card"
          >
            <span>📋</span>

            <div>
              <h3>
                All Events
              </h3>

              <p>
                View the complete
                itinerary.
              </p>
            </div>
          </Link>

          <Link
            to="/weekend-notes"
            className="quick-link-card"
          >
            <span>📝</span>

            <div>
              <h3>
                Notes
              </h3>

              <p>
                Shared notes and
                checklist.
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;