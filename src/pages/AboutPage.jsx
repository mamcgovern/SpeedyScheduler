function AboutPage() {
  return (
    <div className="page">
      <header className="page-heading">
        <p className="page-heading__eyebrow">About the app</p>
        <h1>About Speedy Scheduler</h1>
        <p>
          Speedy Scheduler helps you organize busy weekends with fixed-time
          events.
        </p>
      </header>

      <section className="placeholder-card">
        <h2>Plan more. Miss less.</h2>
        <p>
          Select required and optional events, identify conflicts, and build
          the itinerary that works best for you.
        </p>
      </section>
    </div>
  );
}

export default AboutPage;