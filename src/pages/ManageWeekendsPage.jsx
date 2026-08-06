import {
  useEffect,
  useState,
} from "react";

import {
  createWeekend,
  deleteWeekend,
  updateWeekend,
} from "../services/weekends";

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
  const [
    mode,
    setMode,
  ] = useState("create");

  const [
    editingWeekendId,
    setEditingWeekendId,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState(EMPTY_FORM);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    if (
      mode !== "edit" ||
      !editingWeekendId
    ) {
      return;
    }

    const weekend =
      weekends.find(
        (item) =>
          item.id ===
          editingWeekendId,
      );

    if (!weekend) {
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
        weekend.locationName ??
        "",

      locationAddress:
        weekend.locationAddress ??
        "",

      latitude:
        weekend.latitude ?? "",

      longitude:
        weekend.longitude ?? "",
    });
  }, [
    mode,
    editingWeekendId,
    weekends,
  ]);

  function updateField(
    event,
  ) {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      }),
    );
  }

  function resetForm() {
    setMode("create");
    setEditingWeekendId(
      null,
    );

    setForm(
      EMPTY_FORM,
    );

    setErrorMessage("");
  }

  function editWeekend(
    weekend,
  ) {
    setMode("edit");

    setEditingWeekendId(
      weekend.id,
    );

    setErrorMessage("");
  }

  async function handleSubmit(
    event,
  ) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.startDate ||
      !form.endDate
    ) {
      setErrorMessage(
        "Enter a title, start date, and end date.",
      );

      return;
    }

    setSaving(true);
    setErrorMessage("");

    const weekendData = {
      title:
        form.title.trim(),

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

      latitude:
        form.latitude === ""
          ? null
          : Number(
              form.latitude,
            ),

      longitude:
        form.longitude === ""
          ? null
          : Number(
              form.longitude,
            ),
    };

    try {
      if (
        mode === "edit" &&
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
            selectedEventIds:
              [],
            notes: "",
            checklist: [],
          });

        onSelectWeekend(
          newWeekendId,
        );
      }

      resetForm();
    } catch (error) {
      console.error(
        "Could not save weekend:",
        error,
      );

      setErrorMessage(
        "The weekend could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    weekend,
  ) {
    if (
      weekends.length <= 1
    ) {
      window.alert(
        "You must keep at least one weekend.",
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${weekend.title}"? This cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteWeekend(
        weekend.id,
      );

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
        "The weekend could not be deleted.",
      );
    }
  }

  return (
    <div className="manage-weekends-page">
      <header className="page-heading">
        <p className="page-heading__eyebrow">
          Speedy Scheduler
        </p>

        <h1>
          Manage Weekends
        </h1>

        <p>
          Create new weekends or
          update the title, dates,
          location, and weather
          coordinates.
        </p>
      </header>

      <section className="manage-weekends-grid">
        <article className="weekends-list-card">
          <h2>
            Saved Weekends
          </h2>

          <div className="weekends-list">
            {weekends.map(
              (weekend) => (
                <article
                  key={weekend.id}
                  className={
                    weekend.id ===
                    activeWeekendId
                      ? "weekend-list-item weekend-list-item--active"
                      : "weekend-list-item"
                  }
                >
                  <div>
                    <h3>
                      {
                        weekend.title
                      }
                    </h3>

                    <p>
                      {
                        weekend.startDate
                      }{" "}
                      to{" "}
                      {
                        weekend.endDate
                      }
                    </p>

                    {weekend.locationName && (
                      <p>
                        📍{" "}
                        {
                          weekend.locationName
                        }
                      </p>
                    )}
                  </div>

                  <div className="weekend-list-item__actions">
                    {weekend.id !==
                      activeWeekendId && (
                      <button
                        type="button"
                        onClick={() =>
                          onSelectWeekend(
                            weekend.id,
                          )
                        }
                      >
                        Open
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        editWeekend(
                          weekend,
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger-button"
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
              ),
            )}
          </div>
        </article>

        <article className="weekend-form-card">
          <div className="weekend-form-card__heading">
            <h2>
              {mode === "edit"
                ? "Edit Weekend"
                : "Create Weekend"}
            </h2>

            {mode === "edit" && (
              <button
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>

          <form
            className="weekend-form"
            onSubmit={
              handleSubmit
            }
          >
            <label>
              Weekend title

              <input
                name="title"
                value={
                  form.title
                }
                onChange={
                  updateField
                }
                placeholder="Family Reunion Weekend"
              />
            </label>

            <label>
              Subtitle

              <input
                name="subtitle"
                value={
                  form.subtitle
                }
                onChange={
                  updateField
                }
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
                  value={
                    form.endDate
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
                onChange={
                  updateField
                }
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
                onChange={
                  updateField
                }
                placeholder="Altoona, Iowa"
              />
            </label>

            <div className="weekend-form__row">
              <label>
                Latitude

                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={
                    form.latitude
                  }
                  onChange={
                    updateField
                  }
                  placeholder="41.65"
                />
              </label>

              <label>
                Longitude

                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={
                    form.longitude
                  }
                  onChange={
                    updateField
                  }
                  placeholder="-93.46"
                />
              </label>
            </div>

            {errorMessage && (
              <p className="form-error">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : mode === "edit"
                  ? "Save Changes"
                  : "Create Weekend"}
            </button>
          </form>
        </article>
      </section>
    </div>
  );
}

export default ManageWeekendsPage;