import { useState } from "react";
import { Route, Routes } from "react-router";
import initialEvents from "./data/events.json";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SchedulerPage from "./pages/SchedulerPage";
import MySchedulePage from "./pages/MySchedulePage";
import EventsPage from "./pages/EventsPage";
import AboutPage from "./pages/AboutPage";
import SpottersGuidePage from "./pages/SpottersGuidePage";
import "./App.css";

function App() {
  const [events, setEvents] = useState(initialEvents);

  return (
    <>
      <Navbar />

      <main className="app">
        <Routes>
          <Route path="/" element={<HomePage events={events} />} />

          <Route
            path="/scheduler"
            element={
              <SchedulerPage
                events={events}
                setEvents={setEvents}
              />
            }
          />

          <Route
            path="/my-schedule"
            element={<MySchedulePage events={events} />}
          />

          <Route
            path="/events"
            element={<EventsPage events={events} />}
          />

          <Route
            path="/spotters-guide"
            element={<SpottersGuidePage />}
          />

          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;