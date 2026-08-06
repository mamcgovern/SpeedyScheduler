const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function parseEventDate(dateString) {
  if (!dateString) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function parseTimeToMinutes(timeString) {
  if (!timeString) {
    return Number.POSITIVE_INFINITY;
  }

  const [time, period] = timeString.trim().split(" ");
  const [rawHour, minute] = time.split(":").map(Number);

  let hour = rawHour;

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  return hour * 60 + minute;
}

export function sortEvents(events) {
  return [...events].sort((firstEvent, secondEvent) => {
    const firstDate = parseEventDate(firstEvent.day);
    const secondDate = parseEventDate(secondEvent.day);

    const dateDifference = firstDate - secondDate;

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return (
      parseTimeToMinutes(firstEvent.start) -
      parseTimeToMinutes(secondEvent.start)
    );
  });
}

export function groupEventsByDay(events) {
  const sortedEvents = sortEvents(events);

  return sortedEvents.reduce((groups, event) => {
    if (!groups[event.day]) {
      groups[event.day] = [];
    }

    groups[event.day].push(event);

    return groups;
  }, {});
}

export function formatEventDate(dateString) {
  const date = parseEventDate(dateString);

  if (!date || Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTimeRange(start, end) {
  if (!start) {
    return "Time not announced";
  }

  if (!end) {
    return start;
  }

  return `${start} – ${end}`;
}

export function doEventsOverlap(firstEvent, secondEvent) {
  if (firstEvent.day !== secondEvent.day) {
    return false;
  }

  // Flexible events may overlap other scheduled events.
  if (firstEvent.allowsOverlap || secondEvent.allowsOverlap) {
    return false;
  }

  // Events without end times are informational milestones.
  if (!firstEvent.end || !secondEvent.end) {
    return false;
  }

  const firstStart = parseTimeToMinutes(firstEvent.start);
  const firstEnd = parseTimeToMinutes(firstEvent.end);
  const secondStart = parseTimeToMinutes(secondEvent.start);
  const secondEnd = parseTimeToMinutes(secondEvent.end);

  return firstStart < secondEnd && secondStart < firstEnd;
}

export function findEventConflicts(
  event,
  events
) {
  return events.filter(
    (otherEvent) =>
      otherEvent.id !== event.id &&
      otherEvent.selected &&
      doEventsOverlap(
        event,
        otherEvent
      )
  );
}

export function getNearestEventDay(events) {
  const uniqueDays = [...new Set(events.map((event) => event.day))]
    .sort((firstDay, secondDay) => {
      return parseEventDate(firstDay) - parseEventDate(secondDay);
    });

  if (uniqueDays.length === 0) {
    return null;
  }

  const today = new Date();

  // Remove the current time so we compare calendar dates only.
  today.setHours(0, 0, 0, 0);

  const upcomingDay = uniqueDays.find((day) => {
    const eventDate = parseEventDate(day);
    eventDate.setHours(0, 0, 0, 0);

    return eventDate >= today;
  });

  // Use the nearest upcoming day. If all event days have passed,
  // default to the final day.
  return upcomingDay ?? uniqueDays[uniqueDays.length - 1];
}

export function formatDayTab(dateString) {
  const date = parseEventDate(dateString);

  if (!date || Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function parseEventDateTime(event) {
  if (!event?.day || !event?.start) {
    return null;
  }

  const [year, month, day] = event.day
    .split("-")
    .map(Number);

  const [time, period] = event.start
    .trim()
    .split(" ");

  let [hour, minute] = time
    .split(":")
    .map(Number);

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  return new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
  );
}

export function getNextScheduledEvent(events, now = new Date()) {
  return events
    .filter((event) => event.selected && event.start)
    .map((event) => ({
      ...event,
      dateTime: parseEventDateTime(event),
    }))
    .filter(
      (event) =>
        event.dateTime &&
        event.dateTime >= now,
    )
    .sort(
      (firstEvent, secondEvent) =>
        firstEvent.dateTime - secondEvent.dateTime,
    )[0] ?? null;
}

export function formatEventDateWithYear(dateString) {
  const date = parseEventDate(dateString);

  if (!date || Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}