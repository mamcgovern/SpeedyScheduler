import { Link } from "react-router";
import {
  formatEventDateWithYear,
  formatTimeRange,
  getNextScheduledEvent,
} from "../utils/eventUtils";
import raceLogo from "../assets/race-logo.png";

function HomePage({ events }) {
  const nextEvent = getNextScheduledEvent(events);

  const selectedCount = events.filter(
    (event) => event.selected,
  ).length;

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">
            August 6–9, 2026
          </p>

          <h1>
            Welcome to Iowa Speedway Race Weekend
          </h1>

          <p className="home-hero__description">
            Your personalized guide to races,
            concerts, driver appearances, and
            everything happening throughout the
            weekend.
          </p>

          <div className="home-hero__actions">
            <Link
              to="/scheduler"
              className="home-button home-button--primary"
            >
              Build My Schedule
            </Link>

            <Link
              to="/my-schedule"
              className="home-button home-button--secondary"
            >
              View My Schedule
            </Link>
          </div>
        </div>

        <div className="home-hero__logo-wrapper">
          <img
            src={raceLogo}
            alt="Iowa Speedway race weekend logo"
            className="home-hero__logo"
          />
        </div>
      </section>

      <section className="home-grid">
        <article className="next-event-card">
          <div className="next-event-card__header">
            <div>
              <p className="home-card__eyebrow">
                Up next
              </p>
              <h2>Next Scheduled Event</h2>
            </div>

            <span className="next-event-card__flag">
              🏁
            </span>
          </div>

          {nextEvent ? (
            <div className="next-event-card__body">
              <span className="next-event-card__category">
                {nextEvent.category}
              </span>

              <h3>{nextEvent.title}</h3>

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
                  📍 {nextEvent.location}
                </p>
              )}

              {nextEvent.allowsOverlap && (
                <p className="next-event-card__flexible">
                  Flexible event: you may leave and
                  return.
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
              <h3>No upcoming events</h3>
              <p>
                Add optional events to your schedule,
                or check back when race weekend begins.
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
            Your weekend
          </p>

          <span className="schedule-status-card__number">
            {selectedCount}
          </span>

          <h2>Events Scheduled</h2>

          <p>
            This includes required events and the
            optional activities you have selected.
          </p>

          <Link to="/my-schedule">
            Review itinerary →
          </Link>
        </article>
      </section>

      <section className="quick-links-section">
        <div className="quick-links-section__heading">
          <div>
            <p className="home-card__eyebrow">
              Helpful information
            </p>
            <h2>Race Weekend Resources</h2>
          </div>
        </div>

        <div className="quick-links">
          <Link
            to="/scheduler"
            className="quick-link-card"
          >
            <span>📅</span>
            <div>
              <h3>Event Scheduler</h3>
              <p>
                Browse events and build your itinerary.
              </p>
            </div>
          </Link>

          <Link
            to="/my-schedule"
            className="quick-link-card"
          >
            <span>✅</span>
            <div>
              <h3>My Schedule</h3>
              <p>
                See only the events currently selected.
              </p>
            </div>
          </Link>

          <a
            href="https://www.iowaspeedway.com/"
            target="_blank"
            rel="noreferrer"
            className="quick-link-card"
          >
            <span>🏟️</span>
            <div>
              <h3>Iowa Speedway</h3>
              <p>
                Visit the official track website.
              </p>
            </div>
          </a>

          <a
            href="https://www.iowaspeedway.com/parking/"
            target="_blank"
            rel="noreferrer"
            className="quick-link-card"
          >
            <span>🚗</span>
            <div>
              <h3>Parking Information</h3>
              <p>
                Review parking and arrival details.
              </p>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}

export default HomePage;