import { useMemo, useState } from "react";
import spottersGuideData from "../data/spottersGuide.json";

const SERIES_OPTIONS = [
    {
        value: "Cup",
        label: "NASCAR Cup Series",
    },
    {
        value: "ORielly",
        label: "NASCAR O'Reilly Auto Parts Series",
    },
];

function normalizeSeriesData(seriesData) {
    if (!Array.isArray(seriesData)) {
        return [];
    }

    return seriesData
        .flat(Infinity)
        .filter(
            (entry) =>
                entry &&
                typeof entry === "object" &&
                entry.driver
        );
}

function SpottersGuidePage() {
    const [activeSeries, setActiveSeries] =
        useState("Cup");
    const [searchTerm, setSearchTerm] =
        useState("");
    const [manufacturerFilter, setManufacturerFilter] =
        useState("All");

    const seriesEntries = useMemo(
        () =>
            normalizeSeriesData(
                spottersGuideData[activeSeries]
            ),
        [activeSeries]
    );

    const manufacturers = useMemo(() => {
        return [
            "All",
            ...new Set(
                seriesEntries
                    .map((entry) => entry.manufacturer)
                    .filter(Boolean)
            ),
        ];
    }, [seriesEntries]);

    const filteredEntries = useMemo(() => {
        const normalizedSearch = searchTerm
            .trim()
            .toLowerCase();

        return seriesEntries
            .filter((entry) => {
                const matchesManufacturer =
                    manufacturerFilter === "All" ||
                    entry.manufacturer ===
                        manufacturerFilter;

                const searchableText = [
                    entry.driver,
                    entry.number,
                    entry.paintScheme,
                    entry.manufacturer,
                    entry.team,
                ]
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    !normalizedSearch ||
                    searchableText.includes(
                        normalizedSearch
                    );

                return (
                    matchesManufacturer &&
                    matchesSearch
                );
            })
            .sort(
                (firstEntry, secondEntry) =>
                    Number(firstEntry.number) -
                    Number(secondEntry.number)
            );
    }, [
        seriesEntries,
        searchTerm,
        manufacturerFilter,
    ]);

    function changeSeries(series) {
        setActiveSeries(series);
        setSearchTerm("");
        setManufacturerFilter("All");
    }

    return (
        <div className="spotters-page">
            <header className="page-heading">
                <p className="page-heading__eyebrow">
                    Race weekend reference
                </p>

                <h1>Spotter&apos;s Guide</h1>

                <p>
                    Browse the drivers, car numbers,
                    paint schemes, manufacturers, and
                    teams competing throughout the
                    weekend.
                </p>
            </header>

            <nav
                className="series-tabs"
                aria-label="Choose racing series"
            >
                {SERIES_OPTIONS.map((series) => (
                    <button
                        key={series.value}
                        type="button"
                        className={
                            activeSeries === series.value
                                ? "series-tab series-tab--active"
                                : "series-tab"
                        }
                        onClick={() =>
                            changeSeries(series.value)
                        }
                    >
                        {series.label}
                    </button>
                ))}
            </nav>

            <section className="spotters-controls">
                <label className="spotters-search">
                    <span className="sr-only">
                        Search drivers
                    </span>

                    <span
                        className="spotters-search__icon"
                        aria-hidden="true"
                    >
                        🔎
                    </span>

                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                        placeholder="Search driver, number, team, or sponsor"
                    />
                </label>

                <label className="spotters-filter">
                    <span>Manufacturer</span>

                    <select
                        value={manufacturerFilter}
                        onChange={(event) =>
                            setManufacturerFilter(
                                event.target.value
                            )
                        }
                    >
                        {manufacturers.map(
                            (manufacturer) => (
                                <option
                                    key={manufacturer}
                                    value={manufacturer}
                                >
                                    {manufacturer}
                                </option>
                            )
                        )}
                    </select>
                </label>
            </section>

            <div className="spotters-results-header">
                <div>
                    <h2>
                        {
                            SERIES_OPTIONS.find(
                                (series) =>
                                    series.value ===
                                    activeSeries
                            )?.label
                        }
                    </h2>

                    <p>
                        {filteredEntries.length}{" "}
                        {filteredEntries.length === 1
                            ? "car"
                            : "cars"}
                    </p>
                </div>
            </div>

            {filteredEntries.length > 0 ? (
                <section className="spotters-grid">
                    {filteredEntries.map((entry) => (
                        <article
                            key={`${activeSeries}-${entry.number}-${entry.driver}`}
                            className="spotter-card"
                        >
                            <div className="spotter-card__image-wrapper">
                                {entry.image ? (
                                    <img
                                        src={entry.image}
                                        alt={`Number ${entry.number} ${entry.driver} ${entry.paintScheme} car`}
                                        className="spotter-card__image"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="spotter-card__image-placeholder">
                                        <span>🏎️</span>
                                        <p>
                                            Image not
                                            available
                                        </p>
                                    </div>
                                )}

                                <span className="spotter-card__number">
                                    {entry.number}
                                </span>
                            </div>

                            <div className="spotter-card__content">
                                <div className="spotter-card__heading">
                                    <div>
                                        <p className="spotter-card__manufacturer">
                                            {
                                                entry.manufacturer
                                            }
                                        </p>

                                        <h3>
                                            {entry.driver}
                                        </h3>
                                    </div>

                                    <span className="spotter-card__small-number">
                                        #{entry.number}
                                    </span>
                                </div>

                                <dl className="spotter-card__details">
                                    <div>
                                        <dt>
                                            Paint scheme
                                        </dt>
                                        <dd>
                                            {entry.paintScheme ||
                                                "Not listed"}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>Team</dt>
                                        <dd>
                                            {entry.team ||
                                                "Not listed"}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </article>
                    ))}
                </section>
            ) : (
                <section className="empty-state">
                    <h2>No cars found</h2>

                    <p>
                        Try changing the series,
                        manufacturer, or search term.
                    </p>
                </section>
            )}
        </div>
    );
}

export default SpottersGuidePage;