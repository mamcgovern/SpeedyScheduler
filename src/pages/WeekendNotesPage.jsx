import {
  useEffect,
  useMemo,
  useState,
} from "react";

function WeekendNotesPage({
  notes,
  checklist,
  onUpdateNotes,
  onUpdateChecklist,
}) {
  const [notesDraft, setNotesDraft] =
    useState(notes);

  const [notesSaveStatus, setNotesSaveStatus] =
    useState("saved");

  const [newItemText, setNewItemText] =
    useState("");

  useEffect(() => {
    if (notesSaveStatus !== "saving") {
      setNotesDraft(notes);
    }
  }, [notes, notesSaveStatus]);

  const completedCount = useMemo(() => {
    return checklist.filter(
      (item) => item.completed,
    ).length;
  }, [checklist]);

  const notesHaveChanges =
    notesDraft !== notes;

  function handleNotesChange(event) {
    setNotesDraft(event.target.value);
    setNotesSaveStatus("unsaved");
  }

  async function saveNotesDraft() {
    setNotesSaveStatus("saving");

    try {
      await onUpdateNotes(notesDraft);
      setNotesSaveStatus("saved");
    } catch (error) {
      console.error(
        "Could not save notes:",
        error,
      );

      setNotesSaveStatus("error");
    }
  }

  function resetNotesDraft() {
    setNotesDraft(notes);
    setNotesSaveStatus("saved");
  }

  function addChecklistItem(event) {
    event.preventDefault();

    const trimmedText =
      newItemText.trim();

    if (!trimmedText) {
      return;
    }

    const newItem = {
      id: crypto.randomUUID(),
      text: trimmedText,
      completed: false,
    };

    onUpdateChecklist([
      ...checklist,
      newItem,
    ]);

    setNewItemText("");
  }

  function toggleChecklistItem(itemId) {
    const updatedChecklist =
      checklist.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          completed: !item.completed,
        };
      });

    onUpdateChecklist(updatedChecklist);
  }

  function deleteChecklistItem(itemId) {
    const updatedChecklist =
      checklist.filter(
        (item) => item.id !== itemId,
      );

    onUpdateChecklist(updatedChecklist);
  }

  function clearCompletedItems() {
    const updatedChecklist =
      checklist.filter(
        (item) => !item.completed,
      );

    onUpdateChecklist(updatedChecklist);
  }

  return (
    <div className="weekend-notes-page">
      <header className="page-heading">
        <p className="page-heading__eyebrow">
          Shared race weekend planning
        </p>

        <h1>Weekend Notes</h1>

        <p>
          Keep shared notes and a checklist
          for everything you and Nick need
          during race weekend.
        </p>
      </header>

      <section className="weekend-notes-grid">
        <article className="notes-card">
          <div className="notes-card__heading">
            <div>
              <p className="home-card__eyebrow">
                Shared notes
              </p>

              <h2>General Notes</h2>
            </div>

            <span
              className={`notes-save-status notes-save-status--${notesSaveStatus}`}
            >
              {notesSaveStatus === "saving" &&
                "Saving..."}

              {notesSaveStatus === "saved" &&
                "✓ Saved"}

              {notesSaveStatus === "unsaved" &&
                "Unsaved changes"}

              {notesSaveStatus === "error" &&
                "Could not save"}
            </span>
          </div>

          <label className="notes-card__label">
            <span className="sr-only">
              Weekend notes
            </span>

            <textarea
              value={notesDraft}
              onChange={handleNotesChange}
              placeholder="Add parking details, meetup plans, reminders, or anything else you both need to remember."
              rows="12"
            />
          </label>

          <div className="notes-card__actions">
            <button
              type="button"
              className="notes-card__save-button"
              onClick={saveNotesDraft}
              disabled={
                !notesHaveChanges ||
                notesSaveStatus === "saving"
              }
            >
              {notesSaveStatus === "saving"
                ? "Saving..."
                : "Save Notes"}
            </button>

            {notesHaveChanges && (
              <button
                type="button"
                className="notes-card__cancel-button"
                onClick={resetNotesDraft}
                disabled={
                  notesSaveStatus === "saving"
                }
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
                Race weekend prep
              </p>

              <h2>Checklist</h2>
            </div>

            <span>
              {completedCount} of{" "}
              {checklist.length} complete
            </span>
          </div>

          <form
            className="checklist-form"
            onSubmit={addChecklistItem}
          >
            <label>
              <span className="sr-only">
                New checklist item
              </span>

              <input
                type="text"
                value={newItemText}
                onChange={(event) =>
                  setNewItemText(
                    event.target.value,
                  )
                }
                placeholder="Add an item"
              />
            </label>

            <button type="submit">
              Add Item
            </button>
          </form>

          {checklist.length > 0 ? (
            <>
              <ul className="checklist-list">
                {checklist.map((item) => (
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
                          toggleChecklistItem(
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
                        deleteChecklistItem(
                          item.id,
                        )
                      }
                      aria-label={`Delete ${item.text}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>

              {completedCount > 0 && (
                <button
                  type="button"
                  className="checklist-clear-button"
                  onClick={
                    clearCompletedItems
                  }
                >
                  Clear completed
                </button>
              )}
            </>
          ) : (
            <div className="checklist-empty">
              <span aria-hidden="true">
                ✅
              </span>

              <h3>
                Nothing on the list yet
              </h3>

              <p>
                Add anything you need to
                pack, bring, buy, or remember.
              </p>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

export default WeekendNotesPage;