import {
  formatTimeRange,
} from "../utils/eventUtils";

function EventCard({
  event,
  conflicts = [],
  onToggle,
  allowSelection = true,
}) {
  const isMilestone =
    !event.end;

  const hasConflict =
    !event.selected &&
    conflicts.length > 0;

  const categoryClass = (
    event.category ||
    "general"
  )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-|-$/g,
      "",
    );

  const classNames = [
    "event-card",
    `event-card--${categoryClass}`,

    event.required
      ? "event-card--required"
      : "",

    event.selected
      ? "event-card--selected"
      : "",

    hasConflict
      ? "event-card--conflict"
      : "",

    isMilestone
      ? "event-card--milestone"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classNames}>
      <div className="event-card__time">
        <span>
          {event.start || "TBA"}
        </span>

        {event.end && (
          <>
            <span className="event-card__time-divider">
              to
            </span>

            <span>
              {event.end}
            </span>
          </>
        )}
      </div>

      <div
        className="event-card__marker"
        aria-hidden="true"
      >
        <span />
      </div>

      <div className="event-card__content">
        <div className="event-card__heading">
          <h3>
            {event.title}
          </h3>

          <div className="event-card__labels">
            {event.required && (
              <span className="event-card__required-label">
                Required
              </span>
            )}

            {event.allowsOverlap && (
              <span className="event-card__flexible-label">
                Flexible
              </span>
            )}
          </div>
        </div>

        <p className="event-card__range">
          {formatTimeRange(
            event.start,
            event.end,
          )}
        </p>

        {event.location && (
          <p className="event-card__location">
            📍 {event.location}
          </p>
        )}

        {hasConflict && (
          <div className="event-card__conflict-message">
            Conflicts with{" "}
            {conflicts
              .map(
                (conflict) =>
                  conflict.title,
              )
              .join(", ")}
          </div>
        )}

        <div className="event-card__footer">
          <span className="event-card__category">
            {event.category ||
              "General"}
          </span>

          {allowSelection &&
            !event.required && (
              <button
                type="button"
                className="event-card__select-button"
                onClick={onToggle}
                disabled={
                  hasConflict
                }
              >
                {event.selected
                  ? "Remove"
                  : hasConflict
                    ? "Conflicts"
                    : "Add to schedule"}
              </button>
            )}
        </div>
      </div>
    </article>
  );
}

export default EventCard;