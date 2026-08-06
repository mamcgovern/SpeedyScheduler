const ACTIVE_WEEKEND_KEY =
  "speedySchedulerActiveWeekend";

export function getSavedWeekendId() {
  return localStorage.getItem(
    ACTIVE_WEEKEND_KEY,
  );
}

export function saveWeekendId(
  weekendId,
) {
  if (!weekendId) {
    localStorage.removeItem(
      ACTIVE_WEEKEND_KEY,
    );

    return;
  }

  localStorage.setItem(
    ACTIVE_WEEKEND_KEY,
    weekendId,
  );
}