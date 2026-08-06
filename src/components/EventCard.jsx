import { formatTimeRange } from "../utils/eventUtils";

function EventCard({ event, onToggle }) {
  const isMilestone = !event.end;

  const categoryClass = event.category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  const classNames = [
    "event-card",
    `event-card--${categoryClass}`,
    event.required ? "event-card--required" : "",
    event.selected ? "event-card--selected" : "",
    isMilestone ? "event-card--milestone" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classNames}>
      <div className="event-card__time">
        <span>{event.start || "TBA"}</span>

        {event.end && (
          <>
            <span className="event-card__time-divider">to</span>
            <span>{event.end}</span>
          </>
        )}
      </div>

      <div className="event-card__marker" aria-hidden="true">
        <span />
      </div>

      <div className="event-card__content">
        <div className="event-card__heading">
          <h3>{event.title}</h3>

          {event.required && (
            <span className="event-card__required-label">Required</span>
          )}
        </div>

        <p className="event-card__range">
          {formatTimeRange(event.start, event.end)}
        </p>

        {event.location && (
          <p className="event-card__location">📍 {event.location}</p>
        )}

        <div className="event-card__footer">
          <span className="event-card__category">{event.category}</span>

          {!event.required && (
            <button
              type="button"
              className="event-card__select-button"
              onClick={onToggle}
            >
              {event.selected ? "Remove" : "Add to schedule"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default EventCard;