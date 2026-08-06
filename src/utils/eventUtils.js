export function parseEventDate(
  dateString,
) {
  if (!dateString) {
    return new Date(NaN);
  }

  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day,
  );
}

export function formatEventDate(
  dateString,
) {
  const date = parseEventDate(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    },
  );
}

export function formatEventDateWithYear(
  dateString,
) {
  const date = parseEventDate(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}

export function formatDayTab(
  dateString,
) {
  const date = parseEventDate(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    },
  );
}

export function formatWeekendDateRange(
  startDate,
  endDate,
) {
  const start = parseEventDate(startDate);
  const end = parseEventDate(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return "";
  }

  if (startDate === endDate) {
    return start.toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      },
    );
  }

  const sameYear =
    start.getFullYear() ===
    end.getFullYear();

  const sameMonth =
    sameYear &&
    start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${start.toLocaleDateString(
      "en-US",
      {
        month: "long",
      },
    )} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
  }

  if (sameYear) {
    return `${start.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      },
    )} – ${end.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    )}`;
  }

  return `${start.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  )} – ${end.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  )}`;
}

export function formatTimeRange(
  start,
  end,
) {
  if (!start) {
    return "Time to be announced";
  }

  if (!end) {
    return start;
  }

  return `${start} – ${end}`;
}

function parseTime(
  dateString,
  timeString,
) {
  if (!dateString || !timeString) {
    return null;
  }

  const date = parseEventDate(dateString);

  const match = timeString
    .trim()
    .match(
      /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i,
    );

  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(
    match[2] ?? 0,
  );
  const period =
    match[3].toUpperCase();

  if (
    period === "AM" &&
    hour === 12
  ) {
    hour = 0;
  }

  if (
    period === "PM" &&
    hour !== 12
  ) {
    hour += 12;
  }

  date.setHours(
    hour,
    minute,
    0,
    0,
  );

  return date;
}

export function getEventDateTime(
  event,
) {
  return parseTime(
    event?.day,
    event?.start,
  );
}

export function getEventEndDateTime(
  event,
) {
  return parseTime(
    event?.day,
    event?.end,
  );
}

export function getNearestEventDay(
  events,
  now = new Date(),
) {
  const days = [
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

  if (days.length === 0) {
    return null;
  }

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const upcomingDay = days.find(
    (day) =>
      parseEventDate(day) >= today,
  );

  return (
    upcomingDay ??
    days[days.length - 1]
  );
}

export function doEventsOverlap(
  firstEvent,
  secondEvent,
) {
  if (
    firstEvent.day !==
    secondEvent.day
  ) {
    return false;
  }

  if (
    firstEvent.allowsOverlap ||
    secondEvent.allowsOverlap
  ) {
    return false;
  }

  const firstStart =
    getEventDateTime(firstEvent);

  const firstEnd =
    getEventEndDateTime(firstEvent);

  const secondStart =
    getEventDateTime(secondEvent);

  const secondEnd =
    getEventEndDateTime(secondEvent);

  if (
    !firstStart ||
    !firstEnd ||
    !secondStart ||
    !secondEnd
  ) {
    return false;
  }

  return (
    firstStart < secondEnd &&
    secondStart < firstEnd
  );
}

export function findEventConflicts(
  event,
  events,
) {
  return events.filter(
    (otherEvent) =>
      otherEvent.id !== event.id &&
      otherEvent.selected &&
      doEventsOverlap(
        event,
        otherEvent,
      ),
  );
}

export function getNextScheduledEvent(
  events,
  now = new Date(),
) {
  const upcomingEvents = events
    .filter(
      (event) =>
        event.selected &&
        event.start,
    )
    .map((event) => ({
      ...event,
      dateTime:
        getEventDateTime(event),

      endDateTime:
        getEventEndDateTime(event),
    }))
    .filter((event) => {
      if (!event.dateTime) {
        return false;
      }

      if (event.endDateTime) {
        return (
          event.endDateTime > now
        );
      }

      return event.dateTime >= now;
    })
    .sort(
      (firstEvent, secondEvent) =>
        firstEvent.dateTime -
        secondEvent.dateTime,
    );

  return upcomingEvents[0] ?? null;
}

export function getCountdownText(
  targetDate,
  now = new Date(),
) {
  if (!targetDate) {
    return "";
  }

  const difference =
    targetDate.getTime() -
    now.getTime();

  if (difference <= 0) {
    return "Happening now";
  }

  const totalMinutes = Math.ceil(
    difference / 60000,
  );

  const days = Math.floor(
    totalMinutes / 1440,
  );

  const hours = Math.floor(
    (totalMinutes % 1440) / 60,
  );

  const minutes =
    totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}