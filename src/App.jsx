import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { Route, Routes } from "react-router";

import { auth } from "./firebase";
import initialEvents from "./data/events.json";

import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SchedulerPage from "./pages/SchedulerPage";
import MySchedulePage from "./pages/MySchedulePage";
import EventsPage from "./pages/EventsPage";
import SpottersGuidePage from "./pages/SpottersGuidePage";
import SignInPage from "./pages/SignInPage";
import WeekendNotesPage from "./pages/WeekendNotesPage";
import InstallPage from "./pages/InstallPage";

import {
  saveChecklist,
  saveFavoriteDrivers,
  saveNotes,
  saveSelectedEventIds,
  subscribeToSharedSchedule,
} from "./services/sharedSchedule";

import "./App.css";

const NOTES_SAVE_DELAY = 700;

function App() {
  const [events, setEvents] =
    useState(initialEvents);

  const [
    favoriteDrivers,
    setFavoriteDrivers,
  ] = useState([]);

  const [notes, setNotes] = useState("");
  const [notesSaveStatus, setNotesSaveStatus] =
    useState("saved");

  const [checklist, setChecklist] =
    useState([]);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] =
    useState(true);
  const [
    scheduleLoading,
    setScheduleLoading,
  ] = useState(true);

  const notesSaveTimerRef = useRef(null);
  const latestNotesRef = useRef("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setScheduleLoading(false);
      return undefined;
    }

    setScheduleLoading(true);

    const unsubscribe =
      subscribeToSharedSchedule(
        async (sharedSchedule) => {
          if (!sharedSchedule) {
            const initiallySelectedEventIds =
              initialEvents
                .filter(
                  (event) =>
                    event.required ||
                    event.selected,
                )
                .map((event) => event.id);

            try {
              await saveSelectedEventIds(
                initiallySelectedEventIds,
              );

              await saveFavoriteDrivers([]);
              await saveNotes("");
              await saveChecklist([]);
            } catch (error) {
              console.error(
                "Could not create the shared schedule:",
                error,
              );

              setScheduleLoading(false);
            }

            return;
          }

          const selectedEventIds = new Set(
            sharedSchedule.selectedEventIds ??
            [],
          );

          const updatedEvents =
            initialEvents.map((event) => ({
              ...event,
              selected:
                event.required ||
                selectedEventIds.has(
                  event.id,
                ),
            }));

          setEvents(updatedEvents);

          setFavoriteDrivers(
            Array.isArray(
              sharedSchedule.favoriteDrivers,
            )
              ? sharedSchedule.favoriteDrivers.slice(
                0,
                3,
              )
              : [],
          );

          const sharedNotes =
            typeof sharedSchedule.notes ===
              "string"
              ? sharedSchedule.notes
              : "";

          /*
           * Do not overwrite text while this device
           * has a pending local save.
           */
          if (!notesSaveTimerRef.current) {
            setNotes(sharedNotes);
            latestNotesRef.current =
              sharedNotes;
            setNotesSaveStatus("saved");
          }

          setChecklist(
            Array.isArray(
              sharedSchedule.checklist,
            )
              ? sharedSchedule.checklist
              : [],
          );

          setScheduleLoading(false);
        },
        (error) => {
          console.error(
            "Could not load the shared schedule:",
            error,
          );

          setScheduleLoading(false);
        },
      );

    return unsubscribe;
  }, [user]);

  /*
   * Clear any pending note timer if App unmounts.
   */
  useEffect(() => {
    return () => {
      if (notesSaveTimerRef.current) {
        window.clearTimeout(
          notesSaveTimerRef.current,
        );
      }
    };
  }, []);

  async function updateEventSelection(
    eventId,
    shouldBeSelected,
  ) {
    const eventToUpdate = events.find(
      (event) => event.id === eventId,
    );

    if (!eventToUpdate) {
      return;
    }

    if (
      eventToUpdate.required &&
      !shouldBeSelected
    ) {
      return;
    }

    const previousEvents = events;

    const updatedEvents = events.map(
      (event) => {
        if (event.id !== eventId) {
          return event;
        }

        return {
          ...event,
          selected:
            event.required ||
            shouldBeSelected,
        };
      },
    );

    setEvents(updatedEvents);

    const selectedEventIds = updatedEvents
      .filter((event) => event.selected)
      .map((event) => event.id);

    try {
      await saveSelectedEventIds(
        selectedEventIds,
      );
    } catch (error) {
      console.error(
        "Could not save the shared schedule:",
        error,
      );

      setEvents(previousEvents);

      window.alert(
        "The shared schedule could not be updated. Please try again.",
      );
    }
  }

  async function updateFavoriteDrivers(
    updatedFavorites,
  ) {
    if (!Array.isArray(updatedFavorites)) {
      return;
    }

    const limitedFavorites =
      updatedFavorites.slice(0, 3);

    const previousFavorites =
      favoriteDrivers;

    setFavoriteDrivers(limitedFavorites);

    try {
      await saveFavoriteDrivers(
        limitedFavorites,
      );
    } catch (error) {
      console.error(
        "Could not save favorite drivers:",
        error,
      );

      setFavoriteDrivers(
        previousFavorites,
      );

      window.alert(
        "Favorite drivers could not be updated. Please try again.",
      );
    }
  }

  /*
   * Update the text immediately, but wait until
   * typing pauses for 700 ms before writing to
   * Firestore.
   */
  async function updateNotes(updatedNotes) {
    const previousNotes = notes;

    setNotes(updatedNotes);

    try {
      await saveNotes(updatedNotes);
    } catch (error) {
      console.error(
        "Could not save weekend notes:",
        error,
      );

      setNotes(previousNotes);

      throw error;
    }
  }

  async function retryNotesSave() {
    setNotesSaveStatus("saving");

    try {
      await saveNotes(
        latestNotesRef.current,
      );

      setNotesSaveStatus("saved");
    } catch (error) {
      console.error(
        "Could not save weekend notes:",
        error,
      );

      setNotesSaveStatus("error");
    }
  }

  async function updateChecklist(
    updatedChecklist,
  ) {
    if (!Array.isArray(updatedChecklist)) {
      return;
    }

    const previousChecklist = checklist;

    setChecklist(updatedChecklist);

    try {
      await saveChecklist(
        updatedChecklist,
      );
    } catch (error) {
      console.error(
        "Could not save the checklist:",
        error,
      );

      setChecklist(previousChecklist);

      window.alert(
        "The checklist could not be saved. Please try again.",
      );
    }
  }

  async function handleSignOut() {
    try {
      /*
       * Save pending notes before signing out.
       */
      if (notesSaveTimerRef.current) {
        window.clearTimeout(
          notesSaveTimerRef.current,
        );

        notesSaveTimerRef.current = null;

        await saveNotes(
          latestNotesRef.current,
        );
      }

      await signOut(auth);
    } catch (error) {
      console.error(
        "Could not sign out:",
        error,
      );

      window.alert(
        "You could not be signed out. Please try again.",
      );
    }
  }

  if (authLoading) {
    return (
      <main className="app-loading">
        <p>Loading Speedy Scheduler...</p>
      </main>
    );
  }

  if (!user) {
    return <SignInPage />;
  }

  if (scheduleLoading) {
    return (
      <main className="app-loading">
        <p>Loading shared schedule...</p>
      </main>
    );
  }

  return (
    <>
      <Navbar
        user={user}
        onSignOut={handleSignOut}
      />

      <main className="app">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage events={events} />
            }
          />

          <Route
            path="/scheduler"
            element={
              <SchedulerPage
                events={events}
                onUpdateEventSelection={
                  updateEventSelection
                }
              />
            }
          />

          <Route
            path="/my-schedule"
            element={
              <MySchedulePage
                events={events}
                onUpdateEventSelection={
                  updateEventSelection
                }
              />
            }
          />

          <Route
            path="/events"
            element={
              <EventsPage
                events={events}
              />
            }
          />

          <Route
            path="/spotters-guide"
            element={
              <SpottersGuidePage
                favoriteDrivers={
                  favoriteDrivers
                }
                onUpdateFavoriteDrivers={
                  updateFavoriteDrivers
                }
              />
            }
          />

          <Route
            path="/weekend-notes"
            element={
              <WeekendNotesPage
                notes={notes}
                checklist={checklist}
                onUpdateNotes={updateNotes}
                onUpdateChecklist={updateChecklist}
              />
            }
          />
          
          <Route
            path="/install"
            element={<InstallPage />}
          />
        </Routes>
      </main>
    </>
  );
}

export default App;