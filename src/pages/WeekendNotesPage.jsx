import {
  useEffect,
  useMemo,
  useState,
} from "react";

function WeekendNotesPage({
  weekend,
  notes,
  checklist,
  onUpdateNotes,
  onUpdateChecklist,
}) {
  const [
    notesDraft,
    setNotesDraft,
  ] = useState(notes);

  const [
    notesStatus,
    setNotesStatus,
  ] = useState("saved");

  const [
    newItemText,
    setNewItemText,
  ] = useState("");

  useEffect(() => {
    if (
      notesStatus !==
      "unsaved"
    ) {
      setNotesDraft(notes);
    }
  }, [
    notes,
    notesStatus,
  ]);

  const completedCount =
    useMemo(
      () =>
        checklist.filter(
          (item) =>
            item.completed,
        ).length,
      [checklist],
    );

  async function saveNotesDraft() {
    setNotesStatus(
      "saving",
    );

    try {
      await onUpdateNotes(
        notesDraft,
      );

      setNotesStatus(
        "saved",
      );
    } catch (error) {
      console.error(
        error,
      );

      setNotesStatus(
        "error",
      );
    }
  }

  function addChecklistItem(
    event,
  ) {
    event.preventDefault();

    const text =
      newItemText.trim();

    if (!text) {
      return;
    }

    onUpdateChecklist([
      ...checklist,
      {
        id:
          crypto.randomUUID(),
        text,
        completed: false,
      },
    ]);

    setNewItemText("");
  }

  function toggleItem(
    itemId,
  ) {
    onUpdateChecklist(
      checklist.map(
        (item) =>
          item.id === itemId
            ? {
                ...item,
                completed:
                  !item.completed,
              }
            : item,
      ),
    );
  }

  function deleteItem(
    itemId,
  ) {
    onUpdateChecklist(
      checklist.filter(
        (item) =>
          item.id !== itemId,
      ),
    );
  }

  return (
    <div className="weekend-notes-page">
      <header className="page-heading">
        <p className="page-heading__eyebrow">
          {weekend?.title}
        </p>

        <h1>
          Weekend Notes
        </h1>

        <p>
          Keep shared notes and a
          checklist for this
          weekend.
        </p>
      </header>

      <section className="weekend-notes-grid">
        <article className="notes-card">
          <div className="notes-card__heading">
            <div>
              <p className="home-card__eyebrow">
                Shared notes
              </p>

              <h2>
                General Notes
              </h2>
            </div>

            <span className={`notes-save-status notes-save-status--${notesStatus}`}>
              {notesStatus ===
                "saved" &&
                "✓ Saved"}

              {notesStatus ===
                "unsaved" &&
                "Unsaved changes"}

              {notesStatus ===
                "saving" &&
                "Saving..."}

              {notesStatus ===
                "error" &&
                "Could not save"}
            </span>
          </div>

          <textarea
            value={notesDraft}
            onChange={(event) => {
              setNotesDraft(
                event.target.value,
              );

              setNotesStatus(
                "unsaved",
              );
            }}
            rows="12"
            placeholder="Add reminders, addresses, plans, or anything else your group should know."
          />

          <div className="notes-card__actions">
            <button
              type="button"
              className="notes-card__save-button"
              onClick={
                saveNotesDraft
              }
              disabled={
                notesDraft === notes ||
                notesStatus ===
                  "saving"
              }
            >
              Save Notes
            </button>

            {notesDraft !==
              notes && (
              <button
                type="button"
                className="notes-card__cancel-button"
                onClick={() => {
                  setNotesDraft(
                    notes,
                  );

                  setNotesStatus(
                    "saved",
                  );
                }}
              >
                Discard Changes
              </button>
            )}
          </div>
        </article>

        <article className="checklist-card">
          <div className="checklist-card__heading">
            <div>
              <p className="home-card__eyebrow">
                Shared checklist
              </p>

              <h2>Checklist</h2>
            </div>

            <span>
              {completedCount} of{" "}
              {checklist.length}{" "}
              complete
            </span>
          </div>

          <form
            className="checklist-form"
            onSubmit={
              addChecklistItem
            }
          >
            <input
              value={
                newItemText
              }
              onChange={(event) =>
                setNewItemText(
                  event.target.value,
                )
              }
              placeholder="Add an item"
            />

            <button type="submit">
              Add Item
            </button>
          </form>

          {checklist.length >
          0 ? (
            <ul className="checklist-list">
              {checklist.map(
                (item) => (
                  <li
                    key={item.id}
                    className={
                      item.completed
                        ? "checklist-item checklist-item--completed"
                        : "checklist-item"
                    }
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={
                          item.completed
                        }
                        onChange={() =>
                          toggleItem(
                            item.id,
                          )
                        }
                      />

                      <span>
                        {item.text}
                      </span>
                    </label>

                    <button
                      type="button"
                      className="checklist-item__delete"
                      onClick={() =>
                        deleteItem(
                          item.id,
                        )
                      }
                    >
                      ×
                    </button>
                  </li>
                ),
              )}
            </ul>
          ) : (
            <div className="checklist-empty">
              <h3>
                Nothing on the list
              </h3>

              <p>
                Add anything your
                group needs to
                bring, buy, or
                remember.
              </p>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

export default WeekendNotesPage;