import {
    useEffect,
    useMemo,
    useState,
} from "react";
import { Link } from "react-router";

import {
    formatEventDateWithYear,
    formatTimeRange,
    getCountdownText,
    getNextScheduledEvent,
} from "../utils/eventUtils";

import raceLogo from "../assets/race-logo.png";

import WeatherCard from "../components/WeatherCard";

function HomePage({ events }) {
    const [currentTime, setCurrentTime] =
        useState(() => new Date());

    useEffect(() => {
        const timer = window.setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    const nextEvent = useMemo(() => {
        return getNextScheduledEvent(
            events,
            currentTime
        );
    }, [events, currentTime]);

    const selectedCount = events.filter(
        (event) => event.selected
    ).length;

    const countdownText = nextEvent
        ? getCountdownText(
              nextEvent.dateTime,
              currentTime
          )
        : "";

    const isHappeningNow =
        nextEvent &&
        nextEvent.dateTime <= currentTime &&
        nextEvent.endDateTime &&
        nextEvent.endDateTime > currentTime;

    return (
        <div className="home-page">
            <section className="home-hero">
                <div className="home-hero__content">
                    <p className="home-hero__eyebrow">
                        August 6–9, 2026
                    </p>

                    <h1>
                        Welcome to Iowa Speedway
                        Race Weekend
                    </h1>

                    <p className="home-hero__description">
                        Your shared guide to races,
                        concerts, driver appearances,
                        and everything happening
                        throughout the weekend.
                    </p>

                    <div className="home-hero__actions">
                        <Link
                            to="/scheduler"
                            className="home-button home-button--primary"
                        >
                            Build Our Schedule
                        </Link>

                        <Link
                            to="/my-schedule"
                            className="home-button home-button--secondary"
                        >
                            View Our Schedule
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

                            <h2>
                                Next Scheduled Event
                            </h2>
                        </div>

                        <span className="next-event-card__flag">
                            🏁
                        </span>
                    </div>

                    {nextEvent ? (
                        <div className="next-event-card__body">
                            <div className="next-event-card__countdown">
                                <span>
                                    {isHappeningNow
                                        ? "Happening now"
                                        : "Starts in "}
                                </span>

                                <strong>
                                    {isHappeningNow
                                        ? "Now"
                                        : countdownText}
                                </strong>
                            </div>

                            <span className="next-event-card__category">
                                {nextEvent.category}
                            </span>

                            <h3>
                                {nextEvent.title}
                            </h3>

                            <p className="next-event-card__date">
                                {formatEventDateWithYear(
                                    nextEvent.day
                                )}
                            </p>

                            <p className="next-event-card__time">
                                {formatTimeRange(
                                    nextEvent.start,
                                    nextEvent.end
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

                            {nextEvent.allowsOverlap && (
                                <p className="next-event-card__flexible">
                                    Flexible event: you may
                                    leave and return.
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
                                There are no remaining
                                selected events.
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
                        Our weekend
                    </p>

                    <span className="schedule-status-card__number">
                        {selectedCount}
                    </span>

                    <h2>Events Scheduled</h2>

                    <p>
                        This includes required events
                        and the optional activities
                        selected for your shared
                        itinerary.
                    </p>

                    <Link to="/my-schedule">
                        Review itinerary →
                    </Link>
                </article>
            </section>

            <WeatherCard events={events} />

            <section className="quick-links-section">
                <div className="quick-links-section__heading">
                    <div>
                        <p className="home-card__eyebrow">
                            Helpful information
                        </p>

                        <h2>
                            Race Weekend Resources
                        </h2>
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
                                Browse events and build
                                your itinerary.
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
                                See the events currently
                                selected.
                            </p>
                        </div>
                    </Link>

                    <Link
                        to="/events"
                        className="quick-link-card"
                    >
                        <span>🏁</span>

                        <div>
                            <h3>Race Schedule</h3>

                            <p>
                                View all on-track racing
                                sessions.
                            </p>
                        </div>
                    </Link>

                    <Link
                        to="/spotters-guide"
                        className="quick-link-card"
                    >
                        <span>🏎️</span>

                        <div>
                            <h3>
                                Spotter&apos;s Guide
                            </h3>

                            <p>
                                Identify drivers and
                                paint schemes.
                            </p>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default HomePage;