import {
    useMemo,
    useState,
} from "react";

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

function SpottersGuidePage({
    favoriteDrivers,
    onUpdateFavoriteDrivers,
}) {
    const [activeSeries, setActiveSeries] =
        useState("Cup");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [
        manufacturerFilter,
        setManufacturerFilter,
    ] = useState("All");

    const [
        favoriteMessage,
        setFavoriteMessage,
    ] = useState("");

    const seriesEntries = useMemo(() => {
        return normalizeSeriesData(
            spottersGuideData[activeSeries]
        );
    }, [activeSeries]);

    const manufacturers = useMemo(() => {
        return [
            "All",
            ...new Set(
                seriesEntries
                    .map(
                        (entry) =>
                            entry.manufacturer
                    )
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
                    manufacturerFilter ===
                        "All" ||
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
                (
                    firstEntry,
                    secondEntry
                ) => {
                    const firstFavoriteIndex =
                        favoriteDrivers.indexOf(
                            firstEntry.driver
                        );

                    const secondFavoriteIndex =
                        favoriteDrivers.indexOf(
                            secondEntry.driver
                        );

                    const firstIsFavorite =
                        firstFavoriteIndex !== -1;

                    const secondIsFavorite =
                        secondFavoriteIndex !== -1;

                    if (
                        firstIsFavorite &&
                        !secondIsFavorite
                    ) {
                        return -1;
                    }

                    if (
                        !firstIsFavorite &&
                        secondIsFavorite
                    ) {
                        return 1;
                    }

                    if (
                        firstIsFavorite &&
                        secondIsFavorite
                    ) {
                        return (
                            firstFavoriteIndex -
                            secondFavoriteIndex
                        );
                    }

                    return (
                        Number(
                            firstEntry.number
                        ) -
                        Number(
                            secondEntry.number
                        )
                    );
                }
            );
    }, [
        seriesEntries,
        searchTerm,
        manufacturerFilter,
        favoriteDrivers,
    ]);

    function changeSeries(series) {
        setActiveSeries(series);
        setSearchTerm("");
        setManufacturerFilter("All");
        setFavoriteMessage("");
    }

    async function toggleFavorite(driverName) {
        const isAlreadyFavorite =
            favoriteDrivers.includes(
                driverName
            );

        if (isAlreadyFavorite) {
            const updatedFavorites =
                favoriteDrivers.filter(
                    (driver) =>
                        driver !== driverName
                );

            await onUpdateFavoriteDrivers(
                updatedFavorites
            );

            setFavoriteMessage("");
            return;
        }

        if (favoriteDrivers.length >= 3) {
            setFavoriteMessage(
                "You can favorite up to three drivers."
            );

            return;
        }

        const updatedFavorites = [
            ...favoriteDrivers,
            driverName,
        ];

        await onUpdateFavoriteDrivers(
            updatedFavorites
        );

        setFavoriteMessage("");
    }

    const activeSeriesLabel =
        SERIES_OPTIONS.find(
            (series) =>
                series.value === activeSeries
        )?.label ?? activeSeries;

    return (
        <div className="spotters-page">
            <header className="page-heading">
                <p className="page-heading__eyebrow">
                    Race weekend reference
                </p>

                <h1>
                    Spotter&apos;s Guide
                </h1>

                <p>
                    Browse the drivers, car
                    numbers, paint schemes,
                    manufacturers, and teams
                    competing throughout the
                    weekend.
                </p>
            </header>

            <nav
                className="series-tabs"
                aria-label="Choose racing series"
            >
                {SERIES_OPTIONS.map(
                    (series) => (
                        <button
                            key={
                                series.value
                            }
                            type="button"
                            className={
                                activeSeries ===
                                series.value
                                    ? "series-tab series-tab--active"
                                    : "series-tab"
                            }
                            onClick={() =>
                                changeSeries(
                                    series.value
                                )
                            }
                            aria-pressed={
                                activeSeries ===
                                series.value
                            }
                        >
                            {series.label}
                        </button>
                    )
                )}
            </nav>

            <section className="favorite-drivers">
                <div className="favorite-drivers__heading">
                    <div>
                        <p className="home-card__eyebrow">
                            Shared favorites
                        </p>

                        <h2>
                            Favorite Drivers
                        </h2>
                    </div>

                    <span>
                        {
                            favoriteDrivers.length
                        }{" "}
                        / 3 selected
                    </span>
                </div>

                {favoriteDrivers.length >
                0 ? (
                    <div className="favorite-drivers__list">
                        {favoriteDrivers.map(
                            (driver) => (
                                <button
                                    key={
                                        driver
                                    }
                                    type="button"
                                    onClick={() =>
                                        toggleFavorite(
                                            driver
                                        )
                                    }
                                    aria-label={`Remove ${driver} from favorites`}
                                >
                                    <span
                                        aria-hidden="true"
                                    >
                                        ★
                                    </span>

                                    {driver}

                                    <span
                                        aria-hidden="true"
                                    >
                                        ×
                                    </span>
                                </button>
                            )
                        )}
                    </div>
                ) : (
                    <p className="favorite-drivers__empty">
                        Select the star on up
                        to three driver cards.
                        Your choices will be
                        shared between both
                        devices.
                    </p>
                )}

                {favoriteMessage && (
                    <p
                        className="favorite-drivers__message"
                        role="alert"
                    >
                        {favoriteMessage}
                    </p>
                )}
            </section>

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
                    <span>
                        Manufacturer
                    </span>

                    <select
                        value={
                            manufacturerFilter
                        }
                        onChange={(event) =>
                            setManufacturerFilter(
                                event.target.value
                            )
                        }
                    >
                        {manufacturers.map(
                            (
                                manufacturer
                            ) => (
                                <option
                                    key={
                                        manufacturer
                                    }
                                    value={
                                        manufacturer
                                    }
                                >
                                    {
                                        manufacturer
                                    }
                                </option>
                            )
                        )}
                    </select>
                </label>
            </section>

            <div className="spotters-results-header">
                <div>
                    <h2>
                        {activeSeriesLabel}
                    </h2>

                    <p>
                        {
                            filteredEntries.length
                        }{" "}
                        {filteredEntries.length ===
                        1
                            ? "car"
                            : "cars"}
                    </p>
                </div>
            </div>

            {filteredEntries.length > 0 ? (
                <section className="spotters-grid">
                    {filteredEntries.map(
                        (entry) => {
                            const isFavorite =
                                favoriteDrivers.includes(
                                    entry.driver
                                );

                            return (
                                <article
                                    key={`${activeSeries}-${entry.number}-${entry.driver}`}
                                    className={
                                        isFavorite
                                            ? "spotter-card spotter-card--favorite"
                                            : "spotter-card"
                                    }
                                >
                                    <div className="spotter-card__image-wrapper">
                                        {entry.image ? (
                                            <img
                                                src={
                                                    entry.image
                                                }
                                                alt={`Number ${entry.number} ${entry.driver} ${entry.paintScheme} car`}
                                                className="spotter-card__image"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="spotter-card__image-placeholder">
                                                <span
                                                    aria-hidden="true"
                                                >
                                                    🏎️
                                                </span>

                                                <p>
                                                    Image
                                                    not
                                                    available
                                                </p>
                                            </div>
                                        )}

                                        <span className="spotter-card__number">
                                            {
                                                entry.number
                                            }
                                        </span>

                                        <button
                                            type="button"
                                            className={
                                                isFavorite
                                                    ? "spotter-card__favorite spotter-card__favorite--active"
                                                    : "spotter-card__favorite"
                                            }
                                            onClick={() =>
                                                toggleFavorite(
                                                    entry.driver
                                                )
                                            }
                                            aria-label={
                                                isFavorite
                                                    ? `Remove ${entry.driver} from favorites`
                                                    : `Add ${entry.driver} to favorites`
                                            }
                                            aria-pressed={
                                                isFavorite
                                            }
                                        >
                                            {isFavorite
                                                ? "★"
                                                : "☆"}
                                        </button>
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
                                                    {
                                                        entry.driver
                                                    }
                                                </h3>
                                            </div>

                                            <span className="spotter-card__small-number">
                                                #
                                                {
                                                    entry.number
                                                }
                                            </span>
                                        </div>

                                        <dl className="spotter-card__details">
                                            <div>
                                                <dt>
                                                    Paint
                                                    scheme
                                                </dt>

                                                <dd>
                                                    {entry.paintScheme ||
                                                        "Not listed"}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt>
                                                    Team
                                                </dt>

                                                <dd>
                                                    {entry.team ||
                                                        "Not listed"}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </article>
                            );
                        }
                    )}
                </section>
            ) : (
                <section className="empty-state">
                    <h2>
                        No cars found
                    </h2>

                    <p>
                        Try changing the
                        series, manufacturer,
                        or search term.
                    </p>
                </section>
            )}
        </div>
    );
}

export default SpottersGuidePage;