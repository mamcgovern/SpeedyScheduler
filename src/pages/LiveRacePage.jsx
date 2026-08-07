import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const LIVE_FEED_URL =
  "https://cf.nascar.com/live/feeds/live-feed.json";

const REFRESH_INTERVAL = 5000;

const SERIES = {
  1: {
    key: "Cup",
    name: "NASCAR Cup Series",
  },

  2: {
    key: "ORielly",
    name:
      "NASCAR O'Reilly Auto Parts Series",
  },

  3: {
    key: "Truck",
    name:
      "NASCAR Craftsman Truck Series",
  },
};

const FLAGS = {
  1: {
    label: "Green",
    icon: "🟢",
    className: "green",
  },

  2: {
    label: "Caution",
    icon: "🟡",
    className: "yellow",
  },

  3: {
    label: "Red",
    icon: "🔴",
    className: "red",
  },

  4: {
    label: "Finished",
    icon: "🏁",
    className: "checkered",
  },

  6: {
    label: "Stopped",
    icon: "⏹️",
    className: "stopped",
  },

  8: {
    label: "Warm Up",
    icon: "🟠",
    className: "warmup",
  },

  9: {
    label: "Not Active",
    icon: "⚪",
    className: "inactive",
  },
};

function normalizeDriverName(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase();
}

function getPositionChange(vehicle) {
  const start =
    Number(vehicle.starting_position);

  const current =
    Number(vehicle.running_position);

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(current) ||
    start <= 0 ||
    current <= 0
  ) {
    return null;
  }

  return start - current;
}

function formatPositionChange(change) {
  if (change === null) {
    return {
      text: "—",
      className: "",
    };
  }

  if (change > 0) {
    return {
      text: `▲ ${change}`,
      className:
        "live-position-change--gain",
    };
  }

  if (change < 0) {
    return {
      text: `▼ ${Math.abs(change)}`,
      className:
        "live-position-change--loss",
    };
  }

  return {
    text: "—",
    className: "",
  };
}

function formatDelta(vehicle) {
  const position =
    Number(vehicle.running_position);

  if (position === 1) {
    return "Leader";
  }

  const delta = vehicle.delta;

  if (
    delta === null ||
    delta === undefined ||
    delta === ""
  ) {
    return "—";
  }

  const numericDelta =
    Number(delta);

  if (
    !Number.isFinite(numericDelta)
  ) {
    return String(delta);
  }

  /*
   * NASCAR's feed may use delta for
   * seconds behind the leader or laps
   * down depending on scoring state.
   */
  if (
    Number.isInteger(numericDelta) &&
    Math.abs(numericDelta) >= 1
  ) {
    return numericDelta < 0
      ? `${Math.abs(
          numericDelta,
        )} lap${
          Math.abs(numericDelta) === 1
            ? ""
            : "s"
        } down`
      : `+${numericDelta}`;
  }

  return `+${numericDelta.toFixed(
    3,
  )}`;
}

function getVehicleStatus(vehicle) {
  if (vehicle.is_on_dvp) {
    return "DVP";
  }

  switch (
    Number(vehicle.status)
  ) {
    case 1:
      return vehicle.is_on_track
        ? "On Track"
        : "Running";

    case 2:
      return "Behind Wall";

    case 3:
      return "Out";

    default:
      return vehicle.is_on_track
        ? "On Track"
        : "";
  }
}

function DriverRow({
  vehicle,
  favorite = false,
}) {
  const change =
    getPositionChange(vehicle);

  const positionChange =
    formatPositionChange(change);

  return (
    <article
      className={
        favorite
          ? "live-driver-row live-driver-row--favorite"
          : "live-driver-row"
      }
    >
      <div className="live-driver-row__position">
        <span>Position</span>

        <strong>
          {vehicle.running_position ??
            "—"}
        </strong>
      </div>

      <div className="live-driver-row__number">
        #{vehicle.vehicle_number}
      </div>

      <div className="live-driver-row__driver">
        <div>
          {favorite && (
            <span
              className="live-driver-row__star"
              aria-label="Favorite driver"
            >
              ★
            </span>
          )}

          <strong>
            {vehicle.driver
              ?.full_name ??
              "Unknown Driver"}
          </strong>
        </div>

        {vehicle.sponsor_name && (
          <small>
            {vehicle.sponsor_name}
          </small>
        )}
      </div>

      <div className="live-driver-stat">
        <span>Started</span>

        <strong>
          {vehicle.starting_position ??
            "—"}
        </strong>
      </div>

      <div className="live-driver-stat">
        <span>Change</span>

        <strong
          className={
            positionChange.className
          }
        >
          {positionChange.text}
        </strong>
      </div>

      <div className="live-driver-stat">
        <span>Gap</span>

        <strong>
          {formatDelta(vehicle)}
        </strong>
      </div>

      <div className="live-driver-stat">
        <span>Status</span>

        <strong>
          {getVehicleStatus(vehicle) ||
            "—"}
        </strong>
      </div>
    </article>
  );
}

function LiveRacePage({
  favoriteDrivers = {},
}) {
  const [
    liveData,
    setLiveData,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null);

  const loadLiveData =
    useCallback(
      async ({
        initial = false,
      } = {}) => {
        if (initial) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setErrorMessage("");

        try {
          /*
           * Cache-busting timestamp helps
           * prevent the browser from
           * returning an older live feed.
           */
          const response =
            await fetch(
              `${LIVE_FEED_URL}?t=${Date.now()}`,
              {
                cache: "no-store",
              },
            );

          if (!response.ok) {
            throw new Error(
              `NASCAR feed returned ${response.status}.`,
            );
          }

          const text =
            await response.text();

          if (!text.trim()) {
            throw new Error(
              "No live timing data is currently available.",
            );
          }

          const data =
            JSON.parse(text);

          if (
            !data ||
            !Array.isArray(
              data.vehicles,
            )
          ) {
            throw new Error(
              "No active NASCAR session was found.",
            );
          }

          setLiveData(data);

          setLastUpdated(
            new Date(),
          );
        } catch (error) {
          console.error(
            "Could not load NASCAR live timing:",
            error,
          );

          setErrorMessage(
            error.message ||
              "Live timing could not be loaded.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    loadLiveData({
      initial: true,
    });

    const interval =
      window.setInterval(
        () => {
          loadLiveData();
        },
        REFRESH_INTERVAL,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [loadLiveData]);

  const series =
    SERIES[
      liveData?.series_id
    ] ?? {
      key: null,
      name: "NASCAR",
    };

  const activeFavorites =
    series.key
      ? favoriteDrivers[
          series.key
        ] ?? []
      : [];

  const sortedVehicles =
    useMemo(() => {
      if (!liveData?.vehicles) {
        return [];
      }

      return [
        ...liveData.vehicles,
      ].sort(
        (
          firstVehicle,
          secondVehicle,
        ) =>
          Number(
            firstVehicle.running_position,
          ) -
          Number(
            secondVehicle.running_position,
          ),
      );
    }, [liveData]);

  const favoriteVehicles =
    useMemo(() => {
      if (
        activeFavorites.length ===
        0
      ) {
        return [];
      }

      const favoriteNames =
        new Set(
          activeFavorites.map(
            normalizeDriverName,
          ),
        );

      return sortedVehicles.filter(
        (vehicle) =>
          favoriteNames.has(
            normalizeDriverName(
              vehicle.driver
                ?.full_name,
            ),
          ),
      );
    }, [
      sortedVehicles,
      activeFavorites,
    ]);

  const flag =
    FLAGS[
      liveData?.flag_state
    ] ?? {
      label: "Unknown",
      icon: "⚪",
      className: "inactive",
    };

  if (loading) {
    return (
      <div className="live-race-page">
        <header className="page-heading">
          <p className="page-heading__eyebrow">
            Live NASCAR timing
          </p>

          <h1>Live Race</h1>

          <p>
            Connecting to NASCAR
            timing and scoring...
          </p>
        </header>

        <section className="live-race-loading">
          <span
            aria-hidden="true"
          >
            🏁
          </span>

          <p>
            Loading live timing...
          </p>
        </section>
      </div>
    );
  }

  if (
    !liveData &&
    errorMessage
  ) {
    return (
      <div className="live-race-page">
        <header className="page-heading">
          <p className="page-heading__eyebrow">
            Live NASCAR timing
          </p>

          <h1>Live Race</h1>

          <p>
            Follow live running
            positions during
            on-track NASCAR
            sessions.
          </p>
        </header>

        <section className="live-race-offline">
          <span
            aria-hidden="true"
          >
            🏁
          </span>

          <h2>
            No live session right
            now
          </h2>

          <p>
            {errorMessage}
          </p>

          <p>
            This page will become
            useful once NASCAR has
            an active practice,
            qualifying session, or
            race in the live feed.
          </p>

          <button
            type="button"
            onClick={() =>
              loadLiveData({
                initial: true,
              })
            }
          >
            Check Again
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="live-race-page">
      <header className="page-heading live-race-heading">
        <div>
          <p className="page-heading__eyebrow">
            {series.name}
          </p>

          <h1>Live Race</h1>

          <p>
            {liveData.run_name ||
              liveData.track_name ||
              "Live NASCAR timing"}
          </p>
        </div>

        <button
          type="button"
          className="live-race-refresh"
          onClick={() =>
            loadLiveData()
          }
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>
      </header>

      <section className="live-race-status">
        <div
          className={`live-race-flag live-race-flag--${flag.className}`}
        >
          <span
            aria-hidden="true"
          >
            {flag.icon}
          </span>

          <div>
            <small>
              Race Status
            </small>

            <strong>
              {flag.label}
            </strong>
          </div>
        </div>

        <div className="live-race-status__stat">
          <span>
            Current Lap
          </span>

          <strong>
            {liveData.lap_number ??
              "—"}
          </strong>
        </div>

        <div className="live-race-status__stat">
          <span>Total Laps</span>

          <strong>
            {liveData.laps_in_race ??
              "—"}
          </strong>
        </div>

        <div className="live-race-status__stat">
          <span>Laps To Go</span>

          <strong>
            {liveData.laps_to_go ??
              "—"}
          </strong>
        </div>

        {liveData.stage
          ?.stage_num > 0 && (
          <div className="live-race-status__stat">
            <span>Stage</span>

            <strong>
              {
                liveData.stage
                  .stage_num
              }
            </strong>
          </div>
        )}
      </section>

      {lastUpdated && (
        <div className="live-race-updated">
          <span>
            Auto-refreshes every
            5 seconds
          </span>

          <span>
            Last checked{" "}
            {lastUpdated.toLocaleTimeString(
              "en-US",
              {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
              },
            )}
          </span>
        </div>
      )}

      <section className="live-favorites-section">
        <div className="live-section-heading">
          <div>
            <p className="home-card__eyebrow">
              Your favorites
            </p>

            <h2>
              Favorite Drivers
            </h2>
          </div>

          <span>
            {series.name}
          </span>
        </div>

        {activeFavorites.length ===
        0 ? (
          <div className="live-empty-card">
            <p>
              You don't have any
              favorite drivers
              selected for this
              series.
            </p>
          </div>
        ) : favoriteVehicles.length >
          0 ? (
          <div className="live-favorite-list">
            {favoriteVehicles.map(
              (vehicle) => (
                <DriverRow
                  key={
                    vehicle.vehicle_number
                  }
                  vehicle={
                    vehicle
                  }
                  favorite
                />
              ),
            )}
          </div>
        ) : (
          <div className="live-empty-card">
            <p>
              Your favorite drivers
              are not currently in
              this live feed.
            </p>
          </div>
        )}
      </section>

      <section className="live-leaderboard-section">
        <div className="live-section-heading">
          <div>
            <p className="home-card__eyebrow">
              Timing & scoring
            </p>

            <h2>
              Full Leaderboard
            </h2>
          </div>

          <span>
            {sortedVehicles.length}{" "}
            cars
          </span>
        </div>

        <div className="live-leaderboard">
          {sortedVehicles.map(
            (vehicle) => {
              const isFavorite =
                activeFavorites
                  .map(
                    normalizeDriverName,
                  )
                  .includes(
                    normalizeDriverName(
                      vehicle.driver
                        ?.full_name,
                    ),
                  );

              return (
                <DriverRow
                  key={
                    vehicle.vehicle_number
                  }
                  vehicle={
                    vehicle
                  }
                  favorite={
                    isFavorite
                  }
                />
              );
            },
          )}
        </div>
      </section>

      {errorMessage && (
        <p className="live-race-warning">
          The latest refresh
          failed, so the most
          recently received timing
          data is still being
          shown.
        </p>
      )}

      <footer className="live-race-footer">
        Live timing data provided
        by NASCAR.
      </footer>
    </div>
  );
}

export default LiveRacePage;