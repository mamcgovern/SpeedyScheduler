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

                {/* Desktop Navigation */}
                <nav
                    className="navbar__desktop-links"
                    aria-label="Main navigation"
                >
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            isActive
                                ? "navbar__link navbar__link--active"
                                : "navbar__link"
                        }
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/scheduler"
                        className={({ isActive }) =>
                            isActive
                                ? "navbar__link navbar__link--active"
                                : "navbar__link"
                        }
                    >
                        Scheduler
                    </NavLink>

                    <NavLink
                        to="/my-schedule"
                        className={({ isActive }) =>
                            isActive
                                ? "navbar__link navbar__link--active"
                                : "navbar__link"
                        }
                    >
                        My Schedule
                    </NavLink>

                    <div
                        className="navbar__menu"
                        ref={menuRef}
                    >
                        <button
                            type="button"
                            className="navbar__menu-button"
                            onClick={() =>
                                setMenuOpen(
                                    (current) => !current
                                )
                            }
                            aria-expanded={menuOpen}
                            aria-haspopup="true"
                        >
                            More

                            <span
                                className={
                                    menuOpen
                                        ? "navbar__chevron navbar__chevron--open"
                                        : "navbar__chevron"
                                }
                            >
                                ▾
                            </span>
                        </button>

                        {menuOpen && (
                            <div className="navbar__dropdown">
                                <NavLink
                                    to="/events"
                                    className="navbar__dropdown-link"
                                    onClick={closeMenu}
                                >
                                    <span>📅</span>

                                    <span>
                                        <strong>
                                            All Events
                                        </strong>

                                        <small>
                                            Browse every
                                            event
                                        </small>
                                    </span>
                                </NavLink>

                                <NavLink
                                    to="/about"
                                    className="navbar__dropdown-link"
                                    onClick={closeMenu}
                                >
                                    <span>ℹ️</span>

                                    <span>
                                        <strong>
                                            About
                                        </strong>

                                        <small>
                                            About Speedy
                                            Scheduler
                                        </small>
                                    </span>
                                </NavLink>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    className="navbar__mobile-button"
                    onClick={() =>
                        setMenuOpen(
                            (current) => !current
                        )
                    }
                    aria-expanded={menuOpen}
                    aria-label="Open navigation menu"
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <nav
                    className="navbar__mobile-menu"
                    aria-label="Mobile navigation"
                >
                    <NavLink
                        to="/"
                        end
                        onClick={closeMenu}
                    >
                        🏠 Home
                    </NavLink>

                    <NavLink
                        to="/scheduler"
                        onClick={closeMenu}
                    >
                        📅 Scheduler
                    </NavLink>

                    <NavLink
                        to="/my-schedule"
                        onClick={closeMenu}
                    >
                        ✅ My Schedule
                    </NavLink>

                    <NavLink
                        to="/events"
                        onClick={closeMenu}
                    >
                        📋 All Events
                    </NavLink>

                    <NavLink
                        to="/about"
                        onClick={closeMenu}
                    >
                        ℹ️ About
                    </NavLink>
                </nav>
            )}
        </header>
    );
}

export default Navbar;