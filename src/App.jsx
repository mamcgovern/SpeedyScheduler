import {
  useEffect,
  useMemo,
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
import AllEventsPage from "./pages/AllEventsPage";
import WeekendNotesPage from "./pages/WeekendNotesPage";
import ManageWeekendsPage from "./pages/ManageWeekendsPage";
import InstallPage from "./pages/InstallPage";
import SignInPage from "./pages/SignInPage";

import {
  createWeekendWithId,
  subscribeToWeekend,
  subscribeToWeekends,
  updateWeekend,
} from "./services/weekends";

import {
  getSavedWeekendId,
  saveWeekendId,
} from "./utils/weekendStorage";

import "./styles/index.css";

const IOWA_WEEKEND_ID =
  "iowa-speedway-2026";

const INITIAL_IOWA_WEEKEND = {
  title: "Iowa Speedway Weekend",
  subtitle: "NASCAR Race Weekend",

  locationName:
    "Iowa Speedway",

  locationAddress:
    "Newton, Iowa",

  startDate:
    "2026-08-06",

  endDate:
    "2026-08-09",

  latitude: 41.6746,
  longitude: -93.013,

  events: initialEvents.map(
    (event) => {
      const {
        selected,
        ...eventData
      } = event;

      return eventData;
    },
  ),

  selectedEventIds:
    initialEvents
      .filter(
        (event) =>
          event.required ||
          event.selected,
      )
      .map((event) => event.id),

  notes: "",
  checklist: [],
};

function App() {
  const [user, setUser] =
    useState(null);

  const [
    authLoading,
    setAuthLoading,
  ] = useState(true);

  const [
    weekends,
    setWeekends,
  ] = useState([]);

  const [
    weekendsLoading,
    setWeekendsLoading,
  ] = useState(true);

  const [
    activeWeekendId,
    setActiveWeekendId,
  ] = useState(
    getSavedWeekendId,
  );

  const [
    activeWeekend,
    setActiveWeekend,
  ] = useState(null);

  const [
    weekendLoading,
    setWeekendLoading,
  ] = useState(false);

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
      setWeekends([]);
      setWeekendsLoading(false);
      return undefined;
    }

    setWeekendsLoading(true);

    const unsubscribe =
      subscribeToWeekends(
        async (
          loadedWeekends,
        ) => {
          if (
            loadedWeekends.length === 0
          ) {
            try {
              await createWeekendWithId(
                IOWA_WEEKEND_ID,
                INITIAL_IOWA_WEEKEND,
              );
            } catch (error) {
              console.error(
                "Could not create the initial weekend:",
                error,
              );

              setWeekendsLoading(
                false,
              );
            }

            return;
          }

          setWeekends(
            loadedWeekends,
          );

          setWeekendsLoading(false);

          const savedWeekendId =
            getSavedWeekendId();

          const savedWeekendExists =
            loadedWeekends.some(
              (weekend) =>
                weekend.id ===
                savedWeekendId,
            );

          if (
            savedWeekendExists
          ) {
            setActiveWeekendId(
              savedWeekendId,
            );
          } else {
            const firstWeekendId =
              loadedWeekends[0].id;

            setActiveWeekendId(
              firstWeekendId,
            );

            saveWeekendId(
              firstWeekendId,
            );
          }
        },
        (error) => {
          console.error(
            "Could not load weekends:",
            error,
          );

          setWeekendsLoading(false);
        },
      );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (
      !user ||
      !activeWeekendId
    ) {
      setActiveWeekend(null);
      return undefined;
    }

    setWeekendLoading(true);

    const unsubscribe =
      subscribeToWeekend(
        activeWeekendId,
        (weekend) => {
          setActiveWeekend(
            weekend,
          );

          setWeekendLoading(
            false,
          );
        },
        (error) => {
          console.error(
            "Could not load the selected weekend:",
            error,
          );

          setWeekendLoading(
            false,
          );
        },
      );

    return unsubscribe;
  }, [
    user,
    activeWeekendId,
  ]);

  useEffect(() => {
    document.title =
      activeWeekend?.title
        ? `${activeWeekend.title} | Speedy Scheduler`
        : "Speedy Scheduler";
  }, [activeWeekend]);

  const events = useMemo(() => {
    if (!activeWeekend) {
      return [];
    }

    const selectedIds =
      new Set(
        activeWeekend
          .selectedEventIds ?? [],
      );

    return (
      activeWeekend.events ?? []
    ).map((event) => ({
      ...event,

      selected:
        event.required ||
        selectedIds.has(
          event.id,
        ),
    }));
  }, [activeWeekend]);

  function selectWeekend(
    weekendId,
  ) {
    setActiveWeekendId(
      weekendId,
    );

    saveWeekendId(
      weekendId,
    );
  }

  async function updateEventSelection(
    eventId,
    shouldBeSelected,
  ) {
    if (!activeWeekend) {
      return;
    }

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

    const selectedIds =
      new Set(
        activeWeekend
          .selectedEventIds ?? [],
      );

    if (shouldBeSelected) {
      selectedIds.add(
        eventId,
      );
    } else {
      selectedIds.delete(
        eventId,
      );
    }

    for (
      const event
      of activeWeekend.events ?? []
    ) {
      if (event.required) {
        selectedIds.add(
          event.id,
        );
      }
    }

    try {
      await updateWeekend(
        activeWeekend.id,
        {
          selectedEventIds:
            [...selectedIds],
        },
      );
    } catch (error) {
      console.error(
        "Could not update the schedule:",
        error,
      );

      window.alert(
        "The schedule could not be updated.",
      );
    }
  }

  async function updateNotes(
    updatedNotes,
  ) {
    if (!activeWeekend) {
      return;
    }

    await updateWeekend(
      activeWeekend.id,
      {
        notes: updatedNotes,
      },
    );
  }

  async function updateChecklist(
    updatedChecklist,
  ) {
    if (!activeWeekend) {
      return;
    }

    await updateWeekend(
      activeWeekend.id,
      {
        checklist:
          updatedChecklist,
      },
    );
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

  if (
    weekendsLoading ||
    weekendLoading
  ) {
    return (
      <main className="app-loading">
        <p>
          Loading weekend...
        </p>
      </main>
    );
  }

  return (
    <>
      <Navbar
        user={user}
        weekends={weekends}
        activeWeekendId={
          activeWeekendId
        }
        activeWeekend={
          activeWeekend
        }
        onSelectWeekend={
          selectWeekend
        }
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
                weekend={
                  activeWeekend
                }
                events={events}
              />
            }
          />

          <Route
            path="/scheduler"
            element={
              <SchedulerPage
                weekend={
                  activeWeekend
                }
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
                weekend={
                  activeWeekend
                }
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
              <AllEventsPage
                weekend={activeWeekend}
                events={events}
                onUpdateWeekend={(updates) =>
                  updateWeekend(
                    activeWeekend.id,
                    updates,
                  )
                }
              />
            }
          />

          <Route
            path="/weekend-notes"
            element={
              <WeekendNotesPage
                weekend={
                  activeWeekend
                }
                notes={
                  activeWeekend
                    ?.notes ?? ""
                }
                checklist={
                  activeWeekend
                    ?.checklist ?? []
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
            path="/manage-weekends"
            element={
              <ManageWeekendsPage
                weekends={
                  weekends
                }
                activeWeekendId={
                  activeWeekendId
                }
                onSelectWeekend={
                  selectWeekend
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