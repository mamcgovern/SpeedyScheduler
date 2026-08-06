import {
  useEffect,
  useState,
} from "react";

import {
  createWeekend,
  deleteWeekend,
  updateWeekend,
} from "../services/weekends";

import {
  formatWeekendDateRange,
} from "../utils/eventUtils";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  startDate: "",
  endDate: "",
  locationName: "",
  locationAddress: "",
  latitude: "",
  longitude: "",
};

function ManageWeekendsPage({
  weekends,
  activeWeekendId,
  onSelectWeekend,
}) {
  const [formMode, setFormMode] =
    useState("closed");

  const [
    editingWeekendId,
    setEditingWeekendId,
  ] = useState(null);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [saving, setSaving] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    if (
      formMode !== "edit" ||
      !editingWeekendId
    ) {
      return;
    }

    const weekend = weekends.find(
      (item) =>
        item.id === editingWeekendId,
    );

    if (!weekend) {
      closeForm();
      return;
    }

    setForm({
      title:
        weekend.title ?? "",

      subtitle:
        weekend.subtitle ?? "",

      startDate:
        weekend.startDate ?? "",

      endDate:
        weekend.endDate ?? "",

      locationName:
        weekend.locationName ?? "",

      locationAddress:
        weekend.locationAddress ?? "",

      latitude:
        weekend.latitude ?? "",

      longitude:
        weekend.longitude ?? "",
    });
  }, [
    formMode,
    editingWeekendId,
    weekends,
  ]);

  function updateField(event) {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (currentForm) => ({
        ...currentForm,
        [name]: value,
      }),
    );
  }

  function openCreateForm() {
    setFormMode("create");
    setEditingWeekendId(null);
    setForm(EMPTY_FORM);
    setErrorMessage("");
  }

  function openEditForm(weekend) {
    setFormMode("edit");
    setEditingWeekendId(
      weekend.id,
    );

    setForm({
      title:
        weekend.title ?? "",

      subtitle:
        weekend.subtitle ?? "",

      startDate:
        weekend.startDate ?? "",

      endDate:
        weekend.endDate ?? "",

      locationName:
        weekend.locationName ?? "",

      locationAddress:
        weekend.locationAddress ?? "",

      latitude:
        weekend.latitude ?? "",

      longitude:
        weekend.longitude ?? "",
    });

    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    setFormMode("closed");
    setEditingWeekendId(null);
    setForm(EMPTY_FORM);
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const title = form.title.trim();

    if (
      !title ||
      !form.startDate ||
      !form.endDate
    ) {
      setErrorMessage(
        "Enter a weekend title, start date, and end date.",
      );

      return;
    }

    if (
      form.endDate <
      form.startDate
    ) {
      setErrorMessage(
        "The end date cannot be before the start date.",
      );

      return;
    }

    const latitude =
      form.latitude === ""
        ? null
        : Number(form.latitude);

    const longitude =
      form.longitude === ""
        ? null
        : Number(form.longitude);

    if (
      latitude !== null &&
      !Number.isFinite(latitude)
    ) {
      setErrorMessage(
        "Enter a valid latitude.",
      );

      return;
    }

    if (
      longitude !== null &&
      !Number.isFinite(longitude)
    ) {
      setErrorMessage(
        "Enter a valid longitude.",
      );

      return;
    }

    setSaving(true);
    setErrorMessage("");

    const weekendData = {
      title,

      subtitle:
        form.subtitle.trim(),

      startDate:
        form.startDate,

      endDate:
        form.endDate,

      locationName:
        form.locationName.trim(),

      locationAddress:
        form.locationAddress.trim(),

      latitude,
      longitude,
    };

    try {
      if (
        formMode === "edit" &&
        editingWeekendId
      ) {
        await updateWeekend(
          editingWeekendId,
          weekendData,
        );
      } else {
        const newWeekendId =
          await createWeekend({
            ...weekendData,

            events: [],

            selectedEventIds: [],

            notes: "",

            checklist: [],
          });

        onSelectWeekend(
          newWeekendId,
        );
      }

      closeForm();
    } catch (error) {
      console.error(
        "Could not save weekend:",
        error,
      );

      setErrorMessage(
        "The weekend could not be saved. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    weekend,
  ) {
    if (weekends.length <= 1) {
      window.alert(
        "You must keep at least one weekend.",
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${weekend.title}"? Its events, schedule, notes, and checklist will also be deleted.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteWeekend(
        weekend.id,
      );

      if (
        editingWeekendId ===
        weekend.id
      ) {
        closeForm();
      }

      if (
        weekend.id ===
        activeWeekendId
      ) {
        const replacement =
          weekends.find(
            (item) =>
              item.id !==
              weekend.id,
          );

        if (replacement) {
          onSelectWeekend(
            replacement.id,
          );
        }
      }
    } catch (error) {
      console.error(
        "Could not delete weekend:",
        error,
      );

      window.alert(
        "The weekend could not be deleted. Please try again.",
      );
    }
  }

  return (
    <div className="manage-weekends-page">
      <header className="page-heading manage-weekends-heading">
        <div>
          <p className="page-heading__eyebrow">
            Speedy Scheduler
          </p>

          <h1>Manage Weekends</h1>

          <p>
            Create weekends and update their
            title, dates, location, and weather
            information.
          </p>
        </div>

        {formMode === "closed" && (
          <button
            type="button"
            className="primary-button manage-weekends-heading__button"
            onClick={openCreateForm}
          >
            + New Weekend
          </button>
        )}
      </header>

      {formMode !== "closed" && (
        <section className="weekend-form-card">
          <div className="weekend-form-card__heading">
            <div>
              <p className="page-heading__eyebrow">
                {formMode === "edit"
                  ? "Update weekend"
                  : "Add weekend"}
              </p>

              <h2>
                {formMode === "edit"
                  ? "Edit Weekend"
                  : "Create New Weekend"}
              </h2>
            </div>

            <button
              type="button"
              className="weekend-form-card__close"
              onClick={closeForm}
              aria-label="Close weekend form"
            >
              ×
            </button>
          </div>

          <form
            className="weekend-form"
            onSubmit={handleSubmit}
          >
            <label>
              Weekend title

              <input
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder="Family Reunion Weekend"
                autoFocus
              />
            </label>

            <label>
              Subtitle

              <input
                name="subtitle"
                value={form.subtitle}
                onChange={updateField}
                placeholder="A weekend with the whole family"
              />
            </label>

            <div className="weekend-form__row">
              <label>
                Start date

                <input
                  type="date"
                  name="startDate"
                  value={
                    form.startDate
                  }
                  onChange={
                    updateField
                  }
                />
              </label>

              <label>
                End date

                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  min={
                    form.startDate ||
                    undefined
                  }
                  onChange={
                    updateField
                  }
                />
              </label>
            </div>

            <label>
              Location name

              <input
                name="locationName"
                value={
                  form.locationName
                }
                onChange={updateField}
                placeholder="Adventureland"
              />
            </label>

            <label>
              Location address

              <input
                name="locationAddress"
                value={
                  form.locationAddress
                }
                onChange={updateField}
                placeholder="Altoona, Iowa"
              />
            </label>

            <div className="weekend-form__row">
              <label>
                Latitude

                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  name="latitude"
                  value={form.latitude}
                  onChange={updateField}
                  placeholder="41.6544"
                />
              </label>

              <label>
                Longitude

                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  name="longitude"
                  value={form.longitude}
                  onChange={updateField}
                  placeholder="-93.4959"
                />
              </label>
            </div>

            <p className="weekend-form__help">
              Latitude and longitude are optional.
              Add them to show weather for this
              weekend on the home page.
            </p>

            {errorMessage && (
              <p
                className="form-error"
                role="alert"
              >
                {errorMessage}
              </p>
            )}

            <div className="weekend-form__actions">
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : formMode ===
                      "edit"
                    ? "Save Changes"
                    : "Create Weekend"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="weekends-list-section">
        <div className="weekends-list-section__heading">
          <div>
            <p className="page-heading__eyebrow">
              Saved plans
            </p>

            <h2>Your Weekends</h2>
          </div>

          <span>
            {weekends.length}{" "}
            {weekends.length === 1
              ? "weekend"
              : "weekends"}
          </span>
        </div>

        {weekends.length > 0 ? (
          <div className="weekends-card-grid">
            {weekends.map(
              (weekend) => {
                const isActive =
                  weekend.id ===
                  activeWeekendId;

                const eventCount =
                  (
                    weekend.events ??
                    []
                  ).length;

                return (
                  <article
                    key={weekend.id}
                    className={
                      isActive
                        ? "weekend-card weekend-card--active"
                        : "weekend-card"
                    }
                  >
                    <div className="weekend-card__top">
                      <span
                        className="weekend-card__icon"
                        aria-hidden="true"
                      >
                        📅
                      </span>

                      {isActive && (
                        <span className="weekend-card__active-label">
                          Current Weekend
                        </span>
                      )}
                    </div>

                    <div className="weekend-card__content">
                      <h3>
                        {weekend.title}
                      </h3>

                      {weekend.subtitle && (
                        <p className="weekend-card__subtitle">
                          {
                            weekend.subtitle
                          }
                        </p>
                      )}

                      <dl className="weekend-card__details">
                        <div>
                          <dt>Dates</dt>

                          <dd>
                            {formatWeekendDateRange(
                              weekend.startDate,
                              weekend.endDate,
                            )}
                          </dd>
                        </div>

                        {(weekend.locationName ||
                          weekend.locationAddress) && (
                          <div>
                            <dt>
                              Location
                            </dt>

                            <dd>
                              {[
                                weekend.locationName,
                                weekend.locationAddress,
                              ]
                                .filter(
                                  Boolean,
                                )
                                .join(
                                  " · ",
                                )}
                            </dd>
                          </div>
                        )}

                        <div>
                          <dt>
                            Events
                          </dt>

                          <dd>
                            {eventCount}{" "}
                            {eventCount === 1
                              ? "event"
                              : "events"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="weekend-card__actions">
                      {!isActive && (
                        <button
                          type="button"
                          className="weekend-card__open-button"
                          onClick={() =>
                            onSelectWeekend(
                              weekend.id,
                            )
                          }
                        >
                          Open Weekend
                        </button>
                      )}

                      <button
                        type="button"
                        className="weekend-card__edit-button"
                        onClick={() =>
                          openEditForm(
                            weekend,
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="weekend-card__delete-button"
                        onClick={() =>
                          handleDelete(
                            weekend,
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        ) : (
          <section className="empty-state">
            <h2>
              No weekends yet
            </h2>

            <p>
              Create your first weekend to
              begin planning.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={openCreateForm}
            >
              Create Weekend
            </button>
          </section>
        )}
      </section>
    </div>
  );
}

export default ManageWeekendsPage;