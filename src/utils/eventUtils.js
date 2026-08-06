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