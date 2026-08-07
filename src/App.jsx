import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  Route,
  Routes,
} from "react-router";

import { auth } from "./firebase";
import initialEvents from "./data/events.json";

import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SchedulerPage from "./pages/SchedulerPage";
import MySchedulePage from "./pages/MySchedulePage";
import SpottersGuidePage from "./pages/SpottersGuidePage";
import WeekendNotesPage from "./pages/WeekendNotesPage";
import InstallPage from "./pages/InstallPage";
import SignInPage from "./pages/SignInPage";
import LiveRacePage from "./pages/LiveRacePage";

import {
  saveChecklist,
  saveFavoriteDrivers,
  saveNotes,
  saveSelectedEventIds,
  subscribeToSharedSchedule,
} from "./services/sharedSchedule";

import "./styles/index.css";

function App() {
  const [
    events,
    setEvents,
  ] = useState(initialEvents);

  const [
    favoriteDrivers,
    setFavoriteDrivers,
  ] = useState({
    Cup: [],
    ORielly: [],
  });

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    checklist,
    setChecklist,
  ] = useState([]);

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    authLoading,
    setAuthLoading,
  ] = useState(true);

  const [
    scheduleLoading,
    setScheduleLoading,
  ] = useState(true);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
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
        async (
          sharedSchedule,
        ) => {
          if (!sharedSchedule) {
            const initiallySelectedEventIds =
              initialEvents
                .filter(
                  (event) =>
                    event.required ||
                    event.selected,
                )
                .map(
                  (event) =>
                    event.id,
                );

            try {
              await saveSelectedEventIds(
                initiallySelectedEventIds,
              );

              await saveFavoriteDrivers({
                Cup: [],
                ORielly: [],
              });

              await saveNotes("");
              await saveChecklist([]);
            } catch (error) {
              console.error(
                "Could not create shared schedule:",
                error,
              );

              setScheduleLoading(
                false,
              );
            }

            return;
          }

          const selectedEventIds =
            new Set(
              sharedSchedule.selectedEventIds ??
              [],
            );

          const updatedEvents =
            initialEvents.map(
              (event) => ({
                ...event,

                selected:
                  event.required ||
                  selectedEventIds.has(
                    event.id,
                  ),
              }),
            );

          setEvents(updatedEvents);

          const storedFavorites =
            sharedSchedule.favoriteDrivers;

          /*
           * New format:
           *
           * favoriteDrivers: {
           *   Cup: [],
           *   ORielly: []
           * }
           */
          if (
            storedFavorites &&
            typeof storedFavorites ===
            "object" &&
            !Array.isArray(
              storedFavorites,
            )
          ) {
            setFavoriteDrivers({
              Cup: Array.isArray(
                storedFavorites.Cup,
              )
                ? storedFavorites.Cup.slice(
                  0,
                  3,
                )
                : [],

              ORielly: Array.isArray(
                storedFavorites.ORielly,
              )
                ? storedFavorites.ORielly.slice(
                  0,
                  3,
                )
                : [],
            });
          } else {
            /*
             * Migration from the old format:
             *
             * favoriteDrivers: [
             *   "Kyle Larson",
             *   ...
             * ]
             *
             * Existing favorites become
             * Cup favorites.
             */
            setFavoriteDrivers({
              Cup: Array.isArray(
                storedFavorites,
              )
                ? storedFavorites.slice(
                  0,
                  3,
                )
                : [],

              ORielly: [],
            });
          }

          setNotes(
            typeof sharedSchedule.notes ===
              "string"
              ? sharedSchedule.notes
              : "",
          );

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
            "Could not load shared schedule:",
            error,
          );

          setScheduleLoading(false);
        },
      );

    return unsubscribe;
  }, [user]);

  async function updateEventSelection(
    eventId,
    shouldBeSelected,
  ) {
    const eventToUpdate =
      events.find(
        (event) =>
          event.id === eventId,
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

    const previousEvents =
      events;

    const updatedEvents =
      events.map((event) => {
        if (
          event.id !== eventId
        ) {
          return event;
        }

        return {
          ...event,

          selected:
            event.required ||
            shouldBeSelected,
        };
      });

    setEvents(updatedEvents);

    const selectedEventIds =
      updatedEvents
        .filter(
          (event) =>
            event.selected,
        )
        .map(
          (event) =>
            event.id,
        );

    try {
      await saveSelectedEventIds(
        selectedEventIds,
      );
    } catch (error) {
      console.error(
        "Could not save schedule:",
        error,
      );

      setEvents(previousEvents);

      window.alert(
        "The shared schedule could not be updated.",
      );
    }
  }

  async function updateFavoriteDrivers(
    updatedFavorites,
  ) {
    const sanitizedFavorites = {
      Cup: Array.isArray(
        updatedFavorites?.Cup,
      )
        ? updatedFavorites.Cup.slice(
          0,
          3,
        )
        : [],

      ORielly: Array.isArray(
        updatedFavorites?.ORielly,
      )
        ? updatedFavorites.ORielly.slice(
          0,
          3,
        )
        : [],
    };

    const previousFavorites =
      favoriteDrivers;

    setFavoriteDrivers(
      sanitizedFavorites,
    );

    try {
      await saveFavoriteDrivers(
        sanitizedFavorites,
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
        "Favorite drivers could not be updated.",
      );
    }
  }

  async function updateNotes(
    updatedNotes,
  ) {
    const previousNotes =
      notes;

    setNotes(updatedNotes);

    try {
      await saveNotes(
        updatedNotes,
      );
    } catch (error) {
      console.error(
        "Could not save notes:",
        error,
      );

      setNotes(previousNotes);

      throw error;
    }
  }

  async function updateChecklist(
    updatedChecklist,
  ) {
    if (
      !Array.isArray(
        updatedChecklist,
      )
    ) {
      return;
    }

    const previousChecklist =
      checklist;

    setChecklist(
      updatedChecklist,
    );

    try {
      await saveChecklist(
        updatedChecklist,
      );
    } catch (error) {
      console.error(
        "Could not save checklist:",
        error,
      );

      setChecklist(
        previousChecklist,
      );

      window.alert(
        "The checklist could not be saved.",
      );
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(
        "Could not sign out:",
        error,
      );

      window.alert(
        "You could not be signed out.",
      );
    }
  }

  if (authLoading) {
    return (
      <main className="app-loading">
        <p>
          Loading Speedy Scheduler...
        </p>
      </main>
    );
  }

  if (!user) {
    return <SignInPage />;
  }

  if (scheduleLoading) {
    return (
      <main className="app-loading">
        <p>
          Loading shared schedule...
        </p>
      </main>
    );
  }

  return (
    <>
      <Navbar
        user={user}
        onSignOut={
          handleSignOut
        }
      />

      <main className="app">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                events={events}
              />
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
            path="/live"
            element={
              <LiveRacePage
                favoriteDrivers={
                  favoriteDrivers
                }
              />
            }
          />

          <Route
            path="/weekend-notes"
            element={
              <WeekendNotesPage
                notes={notes}
                checklist={
                  checklist
                }
                onUpdateNotes={
                  updateNotes
                }
                onUpdateChecklist={
                  updateChecklist
                }
              />
            }
          />

          <Route
            path="/install"
            element={
              <InstallPage />
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default App;