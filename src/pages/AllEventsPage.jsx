import {
  useMemo,
  useState,
} from "react";

import DaySchedule from "../components/DaySchedule";

import {
  formatEventDate,
  formatTimeRange,
  getEventDateTime,
  parseEventDate,
} from "../utils/eventUtils";

const EMPTY_EVENT_FORM = {
  title: "",
  day: "",
  start: "",
  end: "",
  category: "General",
  location: "",
  required: false,
  allowsOverlap: false,
};

function createEventId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `event-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

function convertTimeToInputValue(time) {
  if (!time) {
    return "";
  }

  const match = time
    .trim()
    .match(
      /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i,
    );

  if (!match) {
    return "";
  }

  let hour = Number(match[1]);
  const minute = match[2] ?? "00";
  const period = match[3].toUpperCase();

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  return `${String(hour).padStart(
    2,
    "0",
  )}:${minute}`;
}

function convertInputValueToTime(time) {
  if (!time) {
    return "";
  }

  const [hourString, minute] =
    time.split(":");

  const hour24 = Number(hourString);
  const period =
    hour24 >= 12 ? "PM" : "AM";

  const hour12 =
    hour24 % 12 || 12;

  return `${hour12}:${minute} ${period}`;
}

function AllEventsPage({
  weekend,
  events,
  onUpdateWeekend,
}) {
  const [eventMode, setEventMode] =
    useState("create");

  const [
    editingEventId,
    setEditingEventId,
  ] = useState(null);

  const [eventForm, setEventForm] =
    useState(() => ({
      ...EMPTY_EVENT_FORM,
      day: weekend?.startDate ?? "",
      location:
        weekend?.locationName ?? "",
    }));

  const [
    eventSaving,
    setEventSaving,
  ] = useState(false);

  const [
    eventError,
    setEventError,
  ] = useState("");

  const eventDays = useMemo(() => {
    return [
      ...new Set(
        events
          .map((event) => event.day)
          .filter(Boolean),
      ),
    ].sort(
      (firstDay, secondDay) =>
        parseEventDate(firstDay) -
        parseEventDate(secondDay),
    );
  }, [events]);

  const sortedEvents = useMemo(() => {
    return [...events].sort(
      (firstEvent, secondEvent) => {
        const firstDate =
          getEventDateTime(firstEvent);

        const secondDate =
          getEventDateTime(secondEvent);

        if (firstDate && secondDate) {
          return firstDate - secondDate;
        }

        if (firstDate) {
          return -1;
        }

        if (secondDate) {
          return 1;
        }

        return firstEvent.day.localeCompare(
          secondEvent.day,
        );
      },
    );
  }, [events]);

  function updateEventField(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setEventForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function resetEventForm() {
    setEventMode("create");
    setEditingEventId(null);

    setEventForm({
      ...EMPTY_EVENT_FORM,
      day: weekend?.startDate ?? "",
      location:
        weekend?.locationName ?? "",
    });

    setEventError("");
  }

  function editEvent(event) {
    setEventMode("edit");
    setEditingEventId(event.id);

    setEventForm({
      title: event.title ?? "",
      day: event.day ?? "",
      start: convertTimeToInputValue(
        event.start,
      ),
      end: convertTimeToInputValue(
        event.end,
      ),
      category:
        event.category ?? "General",
      location: event.location ?? "",
      required:
        event.required ?? false,
      allowsOverlap:
        event.allowsOverlap ?? false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveEvent(event) {
    event.preventDefault();

    if (
      !eventForm.title.trim() ||
      !eventForm.day ||
      !eventForm.start
    ) {
      setEventError(
        "Enter a title, date, and start time.",
      );

      return;
    }

    if (
      eventForm.day <
        weekend.startDate ||
      eventForm.day >
        weekend.endDate
    ) {
      setEventError(
        "The event date must fall within the weekend dates.",
      );

      return;
    }

    if (
      eventForm.end &&
      eventForm.end < eventForm.start
    ) {
      setEventError(
        "The end time cannot be before the start time.",
      );

      return;
    }

    setEventSaving(true);
    setEventError("");

    const savedEvent = {
      id:
        eventMode === "edit"
          ? editingEventId
          : createEventId(),

      title: eventForm.title.trim(),
      day: eventForm.day,

      start:
        convertInputValueToTime(
          eventForm.start,
        ),

      end: eventForm.end
        ? convertInputValueToTime(
            eventForm.end,
          )
        : "",

      category:
        eventForm.category.trim() ||
        "General",

      location:
        eventForm.location.trim(),

      required: eventForm.required,

      allowsOverlap:
        eventForm.allowsOverlap,
    };

    const storedEvents =
      weekend.events ?? [];

    const updatedEvents =
      eventMode === "edit"
        ? storedEvents.map(
            (existingEvent) =>
              existingEvent.id ===
              editingEventId
                ? savedEvent
                : existingEvent,
          )
        : [
            ...storedEvents,
            savedEvent,
          ];

    const selectedIds = new Set(
      weekend.selectedEventIds ?? [],
    );

    if (savedEvent.required) {
      selectedIds.add(savedEvent.id);
    }

    try {
      await onUpdateWeekend({
        events: updatedEvents,
        selectedEventIds: [
          ...selectedIds,
        ],
      });

      resetEventForm();
    } catch (error) {
      console.error(
        "Could not save event:",
        error,
      );

      setEventError(
        "The event could not be saved.",
      );
    } finally {
      setEventSaving(false);
    }
  }

  async function deleteEvent(
    eventToDelete,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${eventToDelete.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    const updatedEvents = (
      weekend.events ?? []
    ).filter(
      (event) =>
        event.id !== eventToDelete.id,
    );

    const updatedSelectedIds = (
      weekend.selectedEventIds ?? []
    ).filter(
      (eventId) =>
        eventId !== eventToDelete.id,
    );

    try {
      await onUpdateWeekend({
        events: updatedEvents,
        selectedEventIds:
          updatedSelectedIds,
      });

      if (
        editingEventId ===
        eventToDelete.id
      ) {
        resetEventForm();
      }
    } catch (error) {
      console.error(
        "Could not delete event:",
        error,
      );

      window.alert(
        "The event could not be deleted.",
      );
    }
  }

  if (!weekend) {
    return (
      <section className="empty-state">
        <h1>No weekend selected</h1>
      </section>
    );
  }

  return (
    <div className="all-events-page">
      <header className="page-heading">
        <p className="page-heading__eyebrow">
          {weekend.title}
        </p>

        <h1>All Events</h1>

        <p>
          View, add, edit, or remove events
          for this weekend.
        </p>
      </header>

      <section className="all-events-editor">
        <article className="event-form-card">
          <div className="event-form-card__heading">
            <h2>
              {eventMode === "edit"
                ? "Edit Event"
                : "Add Event"}
            </h2>

            {eventMode === "edit" && (
              <button
                type="button"
                onClick={resetEventForm}
              >
                Cancel
              </button>
            )}
          </div>

          <form
            className="event-form"
            onSubmit={saveEvent}
          >
            <label>
              Event title

              <input
                name="title"
                value={eventForm.title}
                onChange={updateEventField}
                placeholder="Dinner reservation"
              />
            </label>

            <label>
              Date

              <input
                type="date"
                name="day"
                min={weekend.startDate}
                max={weekend.endDate}
                value={eventForm.day}
                onChange={updateEventField}
              />
            </label>

            <div className="event-form__row">
              <label>
                Start time

                <input
                  type="time"
                  name="start"
                  value={eventForm.start}
                  onChange={updateEventField}
                />
              </label>

              <label>
                End time

                <input
                  type="time"
                  name="end"
                  value={eventForm.end}
                  onChange={updateEventField}
                />
              </label>
            </div>

            <label>
              Category

              <input
                name="category"
                value={eventForm.category}
                onChange={updateEventField}
                list="event-category-options"
              />

              <datalist id="event-category-options">
                <option value="General" />
                <option value="Travel" />
                <option value="Food" />
                <option value="Entertainment" />
                <option value="Activity" />
                <option value="Appointment" />
                <option value="Meeting" />
                <option value="Ceremony" />
                <option value="Race" />
                <option value="Other" />
              </datalist>
            </label>

            <label>
              Location

              <input
                name="location"
                value={eventForm.location}
                onChange={updateEventField}
                placeholder="Main entrance"
              />
            </label>

            <label className="event-form__checkbox">
              <input
                type="checkbox"
                name="required"
                checked={eventForm.required}
                onChange={updateEventField}
              />

              <span>
                This event is required
              </span>
            </label>

            <label className="event-form__checkbox">
              <input
                type="checkbox"
                name="allowsOverlap"
                checked={
                  eventForm.allowsOverlap
                }
                onChange={updateEventField}
              />

              <span>
                Allow other events to overlap
                this event
              </span>
            </label>

            {eventError && (
              <p className="form-error">
                {eventError}
              </p>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={eventSaving}
            >
              {eventSaving
                ? "Saving..."
                : eventMode === "edit"
                  ? "Save Event"
                  : "Add Event"}
            </button>
          </form>
        </article>

        <article className="events-editor-list">
          <div className="events-editor-list__heading">
            <h2>Event List</h2>

            <span>
              {sortedEvents.length}{" "}
              {sortedEvents.length === 1
                ? "event"
                : "events"}
            </span>
          </div>

          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => (
              <article
                key={event.id}
                className="event-editor-item"
              >
                <div className="event-editor-item__main">
                  <p className="event-editor-item__date">
                    {formatEventDate(
                      event.day,
                    )}
                  </p>

                  <h3>{event.title}</h3>

                  <p>
                    {formatTimeRange(
                      event.start,
                      event.end,
                    )}
                  </p>

                  {event.location && (
                    <p>
                      📍 {event.location}
                    </p>
                  )}

                  <div className="event-editor-item__labels">
                    <span className="event-editor-item__category">
                      {event.category ||
                        "General"}
                    </span>

                    {event.required && (
                      <span className="event-editor-label event-editor-label--required">
                        Required
                      </span>
                    )}

                    {event.allowsOverlap && (
                      <span className="event-editor-label event-editor-label--flexible">
                        Flexible
                      </span>
                    )}
                  </div>
                </div>

                <div className="event-editor-item__actions">
                  <button
                    type="button"
                    onClick={() =>
                      editEvent(event)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() =>
                      deleteEvent(event)
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          ) : (
            <section className="empty-state">
              <h3>No events yet</h3>

              <p>
                Add the first event using the
                form.
              </p>
            </section>
          )}
        </article>
      </section>

      {eventDays.length > 0 && (
        <section className="all-events-preview">
          <header>
            <p className="page-heading__eyebrow">
              Schedule preview
            </p>

            <h2>Weekend Itinerary</h2>
          </header>

          <div className="schedule">
            {eventDays.map((day) => (
              <DaySchedule
                key={day}
                day={day}
                events={events.filter(
                  (event) =>
                    event.day === day,
                )}
                allEvents={events}
                allowSelection={false}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default AllEventsPage;