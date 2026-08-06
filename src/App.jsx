import { Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import SchedulerPage from "./pages/SchedulerPage";
import MySchedulePage from "./pages/MySchedulePage";
import EventsPage from "./pages/EventsPage";
import AboutPage from "./pages/AboutPage";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <main className="app">
        <Routes>
          <Route path="/" element={<SchedulerPage />} />
          <Route path="/my-schedule" element={<MySchedulePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;