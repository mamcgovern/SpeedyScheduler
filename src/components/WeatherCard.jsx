import {
    useCallback,
    useEffect,
    useState,
} from "react";

const WEATHER_URL =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=41.6746" +
    "&longitude=-93.0130" +
    "&current=temperature_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m,wind_gusts_10m" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_gusts_10m_max,sunrise,sunset" +
    "&temperature_unit=fahrenheit" +
    "&wind_speed_unit=mph" +
    "&precipitation_unit=inch" +
    "&timezone=America%2FChicago" +
    "&forecast_days=7";

function getWeatherDetails(code, isDay = true) {
    if (code === 0) {
        return {
            label: "Clear",
            icon: isDay ? "☀️" : "🌙",
        };
    }

    if (code === 1) {
        return {
            label: "Mostly clear",
            icon: isDay ? "🌤️" : "🌙",
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

    if (code === 45 || code === 48) {
        return {
            label: "Foggy",
            icon: "🌫️",
        };
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return {
            label: "Drizzle",
            icon: "🌦️",
        };
    }

    if ([61, 63, 65, 66, 67].includes(code)) {
        return {
            label: "Rain",
            icon: "🌧️",
        };
    }

    if ([71, 73, 75, 77].includes(code)) {
        return {
            label: "Snow",
            icon: "🌨️",
        };
    }

    if ([80, 81, 82].includes(code)) {
        return {
            label: "Rain showers",
            icon: "🌦️",
        };
    }

    if ([85, 86].includes(code)) {
        return {
            label: "Snow showers",
            icon: "🌨️",
        };
    }

    if ([95, 96, 99].includes(code)) {
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

function formatForecastDay(dateString, index) {
    if (index === 0) {
        return "Today";
    }

    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    const date = new Date(
        year,
        month - 1,
        day,
    );

    return date.toLocaleDateString("en-US", {
        weekday: "short",
    });
}

function formatUpdatedTime(timeString) {
    if (!timeString) {
        return "";
    }

    const date = new Date(timeString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
}

function WeatherCard({ events }) {
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] =
        useState(true);
    const [weatherError, setWeatherError] =
        useState("");

    const loadWeather = useCallback(async () => {
        setWeatherLoading(true);
        setWeatherError("");

        try {
            const response = await fetch(WEATHER_URL);

            if (!response.ok) {
                throw new Error(
                    `Weather request failed: ${response.status}`,
                );
            }

            const data = await response.json();

            if (!data.current || !data.daily) {
                throw new Error(
                    "Weather data was incomplete.",
                );
            }

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
            setWeatherLoading(false);
        }
    }, []);

    useEffect(() => {
        loadWeather();

        const refreshTimer = window.setInterval(
            loadWeather,
            15 * 60 * 1000,
        );

        return () => {
            window.clearInterval(refreshTimer);
        };
    }, [loadWeather]);

    if (weatherLoading && !weather) {
        return (
            <section className="weather-card weather-card--loading">
                <p>Loading Iowa Speedway weather...</p>
            </section>
        );
    }

    if (weatherError && !weather) {
        return (
            <section className="weather-card weather-card--error">
                <div>
                    <p className="home-card__eyebrow">
                        Iowa Speedway
                    </p>

                    <h2>Weather unavailable</h2>

                    <p>{weatherError}</p>
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

    const currentCondition = getWeatherDetails(
        weather.current.weather_code,
        weather.current.is_day !== 0,
    );

    // Determine which event dates exist in the schedule
    const raceDates = [
        ...new Set(
            events.map((event) => event.day)
        ),
    ].sort();

    const dailyForecasts = weather.daily.time
        .map((date, index) => ({
            date,
            weatherCode:
                weather.daily.weather_code[index],
            high:
                weather.daily.temperature_2m_max[index],
            low:
                weather.daily.temperature_2m_min[index],
            rainChance:
                weather.daily
                    .precipitation_probability_max[index],
            windGust:
                weather.daily
                    .wind_gusts_10m_max[index],
        }))
        .filter((forecast) =>
            raceDates.includes(forecast.date)
        );

    return (
        <section className="weather-card">
            <div className="weather-card__header">
                <div>
                    <p className="home-card__eyebrow">
                        Iowa Speedway
                    </p>

                    <h2>Race Weekend Weather</h2>

                    <p className="weather-card__updated">
                        Updated{" "}
                        {formatUpdatedTime(
                            weather.current.time,
                        )}
                    </p>
                </div>

                <button
                    type="button"
                    className="weather-card__refresh"
                    onClick={loadWeather}
                    disabled={weatherLoading}
                    aria-label="Refresh weather"
                >
                    {weatherLoading ? "Refreshing..." : "↻"}
                </button>
            </div>

            <div className="weather-card__current">
                <div className="weather-card__condition-icon">
                    <span aria-hidden="true">
                        {currentCondition.icon}
                    </span>
                </div>

                <div className="weather-card__temperature">
                    <strong>
                        {Math.round(
                            weather.current.temperature_2m,
                        )}
                        °
                    </strong>

                    <div>
                        <h3>{currentCondition.label}</h3>

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
                                weather.current.wind_speed_10m,
                            )}{" "}
                            mph
                        </dd>
                    </div>

                    <div>
                        <dt>Gusts</dt>
                        <dd>
                            {Math.round(
                                weather.current.wind_gusts_10m,
                            )}{" "}
                            mph
                        </dd>
                    </div>

                    <div>
                        <dt>Precipitation</dt>
                        <dd>
                            {weather.current.precipitation.toFixed(
                                2,
                            )}{" "}
                            in
                        </dd>
                    </div>
                </dl>
            </div>

            <div className="weather-card__forecast">
                {dailyForecasts.map(
                    (forecast, index) => {
                        const condition =
                            getWeatherDetails(
                                forecast.weatherCode,
                            );

                        return (
                            <article
                                key={forecast.date}
                                className="weather-day"
                            >
                                <h3>
                                    {formatForecastDay(
                                        forecast.date,
                                        index,
                                    )}
                                </h3>

                                <span
                                    className="weather-day__icon"
                                    aria-hidden="true"
                                >
                                    {condition.icon}
                                </span>

                                <p className="weather-day__condition">
                                    {condition.label}
                                </p>

                                <p className="weather-day__temperatures">
                                    <strong>
                                        {Math.round(forecast.high)}°
                                    </strong>

                                    <span>
                                        {Math.round(forecast.low)}°
                                    </span>
                                </p>

                                <p className="weather-day__rain">
                                    💧 {forecast.rainChance ?? 0}%
                                </p>

                                <p className="weather-day__wind">
                                    Gusts{" "}
                                    {Math.round(forecast.windGust)}{" "}
                                    mph
                                </p>
                            </article>
                        );
                    },
                )}
            </div>

            <div className="weather-card__footer">
                <p>
                    Forecast provided by Open-Meteo.
                </p>

                <a
                    href="https://forecast.weather.gov/MapClick.php?lat=41.6746&lon=-93.0130"
                    target="_blank"
                    rel="noreferrer"
                >
                    View detailed forecast →
                </a>
            </div>
        </section>
    );
}

export default WeatherCard;