import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

function getWeatherDetails(
  code,
  isDay = true,
) {
  if (code === 0) {
    return {
      label: "Clear",
      icon:
        isDay
          ? "☀️"
          : "🌙",
    };
  }

  if (code === 1) {
    return {
      label: "Mostly clear",
      icon: "🌤️",
    };
  }

  if (code === 2) {
    return {
      label: "Partly cloudy",
      icon: "⛅",
    };
  }

  if (code === 3) {
    return {
      label: "Cloudy",
      icon: "☁️",
    };
  }

  if (
    code === 45 ||
    code === 48
  ) {
    return {
      label: "Foggy",
      icon: "🌫️",
    };
  }

  if (
    [
      51,
      53,
      55,
      56,
      57,
    ].includes(code)
  ) {
    return {
      label: "Drizzle",
      icon: "🌦️",
    };
  }

  if (
    [
      61,
      63,
      65,
      66,
      67,
    ].includes(code)
  ) {
    return {
      label: "Rain",
      icon: "🌧️",
    };
  }

  if (
    [
      71,
      73,
      75,
      77,
      85,
      86,
    ].includes(code)
  ) {
    return {
      label: "Snow",
      icon: "🌨️",
    };
  }

  if (
    [
      80,
      81,
      82,
    ].includes(code)
  ) {
    return {
      label: "Showers",
      icon: "🌦️",
    };
  }

  if (
    [
      95,
      96,
      99,
    ].includes(code)
  ) {
    return {
      label: "Thunderstorms",
      icon: "⛈️",
    };
  }

  return {
    label: "Weather unavailable",
    icon: "🌡️",
  };
}

function formatForecastDay(
  dateString,
) {
  const [year, month, day] =
    dateString
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day,
  ).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    },
  );
}

function WeatherCard({
  latitude,
  longitude,
  locationName,
  eventDates,
}) {
  const [
    weather,
    setWeather,
  ] = useState(null);

  const [
    weatherLoading,
    setWeatherLoading,
  ] = useState(true);

  const [
    weatherError,
    setWeatherError,
  ] = useState("");

  const weatherUrl =
    useMemo(() => {
      return (
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        "&current=temperature_2m,apparent_temperature,weather_code,is_day,precipitation,wind_speed_10m,wind_gusts_10m" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_gusts_10m_max" +
        "&temperature_unit=fahrenheit" +
        "&wind_speed_unit=mph" +
        "&precipitation_unit=inch" +
        "&timezone=auto" +
        "&forecast_days=16"
      );
    }, [
      latitude,
      longitude,
    ]);

  const loadWeather =
    useCallback(async () => {
      setWeatherLoading(true);
      setWeatherError("");

      try {
        const response =
          await fetch(
            weatherUrl,
          );

        if (!response.ok) {
          throw new Error(
            `Weather request failed: ${response.status}`,
          );
        }

        const data =
          await response.json();

        setWeather(data);
      } catch (error) {
        console.error(
          "Could not load weather:",
          error,
        );

        setWeatherError(
          "Weather could not be loaded.",
        );
      } finally {
        setWeatherLoading(
          false,
        );
      }
    }, [weatherUrl]);

  useEffect(() => {
    loadWeather();

    const timer =
      window.setInterval(
        loadWeather,
        15 * 60 * 1000,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, [loadWeather]);

  if (
    weatherLoading &&
    !weather
  ) {
    return (
      <section className="weather-card weather-card--loading">
        <p>
          Loading weather...
        </p>
      </section>
    );
  }

  if (
    weatherError &&
    !weather
  ) {
    return (
      <section className="weather-card weather-card--error">
        <div>
          <h2>
            Weather unavailable
          </h2>

          <p>
            {weatherError}
          </p>
        </div>

        <button
          type="button"
          onClick={loadWeather}
        >
          Try Again
        </button>
      </section>
    );
  }

  const currentCondition =
    getWeatherDetails(
      weather.current
        .weather_code,

      weather.current.is_day !==
        0,
    );

  const allowedDates =
    new Set(eventDates);

  const dailyForecasts =
    weather.daily.time
      .map(
        (date, index) => ({
          date,

          weatherCode:
            weather.daily
              .weather_code[index],

          high:
            weather.daily
              .temperature_2m_max[
                index
              ],

          low:
            weather.daily
              .temperature_2m_min[
                index
              ],

          rainChance:
            weather.daily
              .precipitation_probability_max[
                index
              ],

          windGust:
            weather.daily
              .wind_gusts_10m_max[
                index
              ],
        }),
      )
      .filter((forecast) =>
        allowedDates.has(
          forecast.date,
        ),
      );

  return (
    <section className="weather-card">
      <div className="weather-card__header">
        <div>
          <p className="home-card__eyebrow">
            {locationName ||
              "Weekend location"}
          </p>

          <h2>
            Weekend Weather
          </h2>
        </div>

        <button
          type="button"
          className="weather-card__refresh"
          onClick={loadWeather}
          disabled={
            weatherLoading
          }
          aria-label="Refresh weather"
        >
          {weatherLoading
            ? "Refreshing..."
            : "↻"}
        </button>
      </div>

      <div className="weather-card__current">
        <div className="weather-card__condition-icon">
          <span aria-hidden="true">
            {
              currentCondition.icon
            }
          </span>
        </div>

        <div className="weather-card__temperature">
          <strong>
            {Math.round(
              weather.current
                .temperature_2m,
            )}
            °
          </strong>

          <div>
            <h3>
              {
                currentCondition.label
              }
            </h3>

            <p>
              Feels like{" "}
              {Math.round(
                weather.current
                  .apparent_temperature,
              )}
              °
            </p>
          </div>
        </div>

        <dl className="weather-card__current-details">
          <div>
            <dt>Wind</dt>

            <dd>
              {Math.round(
                weather.current
                  .wind_speed_10m,
              )}{" "}
              mph
            </dd>
          </div>

          <div>
            <dt>Gusts</dt>

            <dd>
              {Math.round(
                weather.current
                  .wind_gusts_10m,
              )}{" "}
              mph
            </dd>
          </div>

          <div>
            <dt>
              Precipitation
            </dt>

            <dd>
              {Number(
                weather.current
                  .precipitation ?? 0,
              ).toFixed(2)}{" "}
              in
            </dd>
          </div>
        </dl>
      </div>

      {dailyForecasts.length >
        0 && (
        <div className="weather-card__forecast">
          {dailyForecasts.map(
            (forecast) => {
              const condition =
                getWeatherDetails(
                  forecast.weatherCode,
                );

              return (
                <article
                  key={
                    forecast.date
                  }
                  className="weather-day"
                >
                  <h3>
                    {formatForecastDay(
                      forecast.date,
                    )}
                  </h3>

                  <span
                    className="weather-day__icon"
                    aria-hidden="true"
                  >
                    {
                      condition.icon
                    }
                  </span>

                  <p className="weather-day__condition">
                    {
                      condition.label
                    }
                  </p>

                  <p className="weather-day__temperatures">
                    <strong>
                      {Math.round(
                        forecast.high,
                      )}
                      °
                    </strong>

                    <span>
                      {Math.round(
                        forecast.low,
                      )}
                      °
                    </span>
                  </p>

                  <p className="weather-day__rain">
                    💧{" "}
                    {forecast.rainChance ??
                      0}
                    %
                  </p>

                  <p className="weather-day__wind">
                    Gusts{" "}
                    {Math.round(
                      forecast.windGust,
                    )}{" "}
                    mph
                  </p>
                </article>
              );
            },
          )}
        </div>
      )}

      <div className="weather-card__footer">
        <p>
          Forecast provided by
          Open-Meteo.
        </p>
      </div>
    </section>
  );
}

export default WeatherCard;