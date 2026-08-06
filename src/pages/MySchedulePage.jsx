function MySchedulePage() {
  return (
    <div className="page">
      <header className="page-heading">
        <p className="page-heading__eyebrow">Your itinerary</p>
        <h1>My Schedule</h1>
        <p>
          Review the required and optional events you selected.
        </p>
      </header>

      <section className="placeholder-card">
        <h2>Your selected events will go here</h2>
        <p>
          We will connect this page to your scheduler selections next.
        </p>
      </section>
    </div>
  );
}

export default MySchedulePage;