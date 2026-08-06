function WeekendSwitcher({
  weekends,
  activeWeekendId,
  onSelectWeekend,
}) {
  if (
    !Array.isArray(weekends) ||
    weekends.length === 0
  ) {
    return null;
  }

  return (
    <label className="weekend-switcher">
      <span className="sr-only">
        Choose weekend
      </span>

      <select
        value={
          activeWeekendId ?? ""
        }
        onChange={(event) =>
          onSelectWeekend(
            event.target.value,
          )
        }
      >
        {weekends.map(
          (weekend) => (
            <option
              key={weekend.id}
              value={weekend.id}
            >
              {weekend.title}
            </option>
          ),
        )}
      </select>
    </label>
  );
}

export default WeekendSwitcher;