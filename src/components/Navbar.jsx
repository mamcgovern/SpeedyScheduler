import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    function closeMenu() {
        setMenuOpen(false);
    }

    useEffect(() => {
        function handleOutsideClick(event) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                closeMenu();
            }
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                closeMenu();
            }
        }

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, []);

    return (
        <header className="navbar">
            <div className="navbar__inner">
                <NavLink
                    to="/"
                    className="navbar__brand"
                    onClick={closeMenu}
                >
                    <span
                        className="navbar__logo"
                        aria-hidden="true"
                    >
                        🏁
                    </span>

                    <span>
                        <strong>Speedy</strong> Scheduler
                    </span>
                </NavLink>

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
                                (current) => !current
                            )
                        }
                        aria-expanded={menuOpen}
                        aria-haspopup="true"
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
                            <NavLink
                                to="/"
                                end
                                className="navbar__dropdown-link"
                                onClick={closeMenu}
                            >
                                <span>🏠</span>

                                <span>
                                    <strong>Home</strong>
                                    <small>
                                        Race weekend dashboard
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
                                to="/scheduler"
                                className="navbar__dropdown-link"
                                onClick={closeMenu}
                            >
                                <span>📅</span>

                                <span>
                                    <strong>
                                        Scheduler
                                    </strong>
                                    <small>
                                        Browse and select events
                                    </small>
                                </span>
                            </NavLink>

                            <NavLink
                                to="/racing-events"
                                className="navbar__dropdown-link"
                                onClick={closeMenu}
                            >
                                <span>🏁</span>

                                <span>
                                    <strong>
                                        Racing Events
                                    </strong>
                                    <small>
                                        Browse the full racing event list
                                    </small>
                                </span>
                            </NavLink>

                            <NavLink
                                to="/spotters-guide"
                                className="navbar__dropdown-link"
                                onClick={closeMenu}
                            >
                                <span>🏎️</span>

                                <span>
                                    <strong>
                                        Spotter&apos;s Guide
                                    </strong>
                                    <small>
                                        View drivers and paint schemes
                                    </small>
                                </span>
                            </NavLink>

                            <NavLink
                                to="/live"
                                className="navbar__dropdown-link"
                                onClick={closeMenu}
                            >
                                <span>🏁</span>

                                <span>
                                    <strong>
                                        Live Race
                                    </strong>

                                    <small>
                                        Running positions & live scoring
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
                                    <strong>Weekend Notes</strong>

                                    <small>
                                        Shared notes and checklist
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
                                    <strong>Install App</strong>

                                    <small>
                                        Add Speedy Scheduler to your home screen
                                    </small>
                                </span>
                            </NavLink>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;