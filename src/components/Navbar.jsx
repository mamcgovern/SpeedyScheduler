import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  NavLink,
} from "react-router";

import WeekendSwitcher from "./WeekendSwitcher";

function Navbar({
  user,
  weekends,
  activeWeekendId,
  activeWeekend,
  onSelectWeekend,
  onSignOut,
}) {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const menuRef =
    useRef(null);

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(() => {
    function handleOutsideClick(
      event,
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target,
        )
      ) {
        closeMenu();
      }
    }

    function handleEscape(
      event,
    ) {
      if (
        event.key === "Escape"
      ) {
        closeMenu();
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__left">
          <NavLink
            to="/"
            className="navbar__brand"
            onClick={closeMenu}
          >
            <span
              className="navbar__logo"
              aria-hidden="true"
            >
              📅
            </span>

            <span className="navbar__brand-text">
              <strong>
                Speedy Scheduler
              </strong>

              {activeWeekend && (
                <small>
                  {
                    activeWeekend.title
                  }
                </small>
              )}
            </span>
          </NavLink>

          <WeekendSwitcher
            weekends={weekends}
            activeWeekendId={
              activeWeekendId
            }
            onSelectWeekend={
              onSelectWeekend
            }
          />
        </div>

        <div
          className="navbar__menu"
          ref={menuRef}
        >
          <button
            type="button"
            className={
              menuOpen
                ? "navbar__hamburger navbar__hamburger--open"
                : "navbar__hamburger"
            }
            onClick={() =>
              setMenuOpen(
                (current) =>
                  !current,
              )
            }
            aria-expanded={
              menuOpen
            }
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
          >
            <span />
            <span />
            <span />
          </button>

          {menuOpen && (
            <nav
              className="navbar__dropdown"
              aria-label="Main navigation"
            >
              <div className="navbar__mobile-switcher">
                <WeekendSwitcher
                  weekends={
                    weekends
                  }
                  activeWeekendId={
                    activeWeekendId
                  }
                  onSelectWeekend={(
                    weekendId,
                  ) => {
                    onSelectWeekend(
                      weekendId,
                    );

                    closeMenu();
                  }}
                />
              </div>

              <NavLink
                to="/"
                end
                className="navbar__dropdown-link"
                onClick={closeMenu}
              >
                <span>🏠</span>

                <span>
                  <strong>
                    Home
                  </strong>

                  <small>
                    Weekend dashboard
                  </small>
                </span>
              </NavLink>

              <NavLink
                to="/scheduler"
                className="navbar__dropdown-link"
                onClick={closeMenu}
              >
                <span>📅</span>

                <span>
                  <strong>
                    Schedule Builder
                  </strong>

                  <small>
                    Choose optional events
                  </small>
                </span>
              </NavLink>

              <NavLink
                to="/my-schedule"
                className="navbar__dropdown-link"
                onClick={closeMenu}
              >
                <span>✅</span>

                <span>
                  <strong>
                    My Schedule
                  </strong>

                  <small>
                    View selected events
                  </small>
                </span>
              </NavLink>

              <NavLink
                to="/events"
                className="navbar__dropdown-link"
                onClick={closeMenu}
              >
                <span>📋</span>

                <span>
                  <strong>
                    All Events
                  </strong>

                  <small>
                    View the complete itinerary
                  </small>
                </span>
              </NavLink>

              <NavLink
                to="/weekend-notes"
                className="navbar__dropdown-link"
                onClick={closeMenu}
              >
                <span>📝</span>

                <span>
                  <strong>
                    Weekend Notes
                  </strong>

                  <small>
                    Notes and checklist
                  </small>
                </span>
              </NavLink>

              <NavLink
                to="/manage-weekends"
                className="navbar__dropdown-link"
                onClick={closeMenu}
              >
                <span>⚙️</span>

                <span>
                  <strong>
                    Manage Weekends
                  </strong>

                  <small>
                    Create or edit weekends
                  </small>
                </span>
              </NavLink>

              <NavLink
                to="/install"
                className="navbar__dropdown-link"
                onClick={closeMenu}
              >
                <span>📲</span>

                <span>
                  <strong>
                    Install App
                  </strong>

                  <small>
                    Add to your home screen
                  </small>
                </span>
              </NavLink>

              <button
                type="button"
                className="navbar__sign-out"
                onClick={() => {
                  closeMenu();
                  onSignOut();
                }}
              >
                <span>↪️</span>

                <span>
                  <strong>
                    Sign Out
                  </strong>

                  <small>
                    {user?.email}
                  </small>
                </span>
              </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;