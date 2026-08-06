import {
  useEffect,
  useMemo,
  useState,
} from "react";

function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] =
    useState(null);

  const [isInstalled, setIsInstalled] =
    useState(() => {
      const isStandalone =
        window.matchMedia(
          "(display-mode: standalone)",
        ).matches;

      const isIOSStandalone =
        window.navigator.standalone === true;

      return isStandalone || isIOSStandalone;
    });

  const [installStatus, setInstallStatus] =
    useState("");

  const isIOS = useMemo(() => {
    return /iPhone|iPad|iPod/i.test(
      navigator.userAgent,
    );
  }, []);

  const isAndroid = useMemo(() => {
    return /Android/i.test(
      navigator.userAgent,
    );
  }, []);

  const isChromeLike = useMemo(() => {
    return /Chrome|CriOS|EdgA|SamsungBrowser/i.test(
      navigator.userAgent,
    );
  }, []);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setInstallStatus(
        "Speedy Scheduler was installed successfully.",
      );
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled,
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled,
      );
    };
  }, []);

  async function installApp() {
    if (!deferredPrompt) {
      return;
    }

    setInstallStatus("");

    try {
      await deferredPrompt.prompt();

      const choice =
        await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setInstallStatus(
          "Installation accepted. The app should appear on your home screen shortly.",
        );
      } else {
        setInstallStatus(
          "Installation was canceled. You can try again later.",
        );
      }
    } catch (error) {
      console.error(
        "Could not open install prompt:",
        error,
      );

      setInstallStatus(
        "The install prompt could not be opened. Follow the manual instructions below.",
      );
    } finally {
      setDeferredPrompt(null);
    }
  }

  if (isInstalled) {
    return (
      <div className="install-page">
        <header className="page-heading">
          <p className="page-heading__eyebrow">
            Install Speedy Scheduler
          </p>

          <h1>App Installed</h1>

          <p>
            Speedy Scheduler is already installed
            on this device.
          </p>
        </header>

        <section className="install-complete-card">
          <span
            className="install-complete-card__icon"
            aria-hidden="true"
          >
            🏁
          </span>

          <h2>You&apos;re ready for race weekend!</h2>

          <p>
            Open Speedy Scheduler from your home
            screen whenever you need your shared
            schedule, notes, checklist, or
            Spotter&apos;s Guide.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="install-page">
      <header className="page-heading">
        <p className="page-heading__eyebrow">
          Install Speedy Scheduler
        </p>

        <h1>Download the App</h1>

        <p>
          Add Speedy Scheduler to your phone for
          quick access throughout race weekend.
        </p>
      </header>

      <section className="install-hero-card">
        <div className="install-hero-card__icon">
          <span aria-hidden="true">🏁</span>
        </div>

        <div className="install-hero-card__content">
          <p className="home-card__eyebrow">
            Speedy Scheduler
          </p>

          <h2>Keep race weekend one tap away</h2>

          <p>
            Installing the app adds an icon to your
            home screen and opens Speedy Scheduler
            in its own full-screen window.
          </p>

          {deferredPrompt && (
            <button
              type="button"
              className="install-primary-button"
              onClick={installApp}
            >
              Install Speedy Scheduler
            </button>
          )}

          {installStatus && (
            <p
              className="install-status-message"
              role="status"
            >
              {installStatus}
            </p>
          )}
        </div>
      </section>

      <section className="install-benefits">
        <div className="install-benefits__heading">
          <p className="home-card__eyebrow">
            Why install it?
          </p>

          <h2>Built for race weekend</h2>
        </div>

        <div className="install-benefits__grid">
          <article>
            <span aria-hidden="true">📱</span>
            <h3>Home-screen access</h3>
            <p>
              Open the shared schedule without
              searching through browser tabs.
            </p>
          </article>

          <article>
            <span aria-hidden="true">🏁</span>
            <h3>App-like display</h3>
            <p>
              Speedy Scheduler opens in a dedicated,
              full-screen window.
            </p>
          </article>

          <article>
            <span aria-hidden="true">☁️</span>
            <h3>Shared updates</h3>
            <p>
              Your schedule, favorites, notes, and
              checklist remain synced through
              Firebase.
            </p>
          </article>
        </div>
      </section>

      {isIOS && (
        <section className="install-card install-card--recommended">
          <div className="install-card__heading">
            <span aria-hidden="true">🍎</span>

            <div>
              <p className="home-card__eyebrow">
                Detected device
              </p>

              <h2>Install on iPhone or iPad</h2>
            </div>
          </div>

          <ol className="install-steps">
            <li>
              <span>1</span>
              <div>
                <strong>Open this page in Safari</strong>
                <p>
                  Installation may not work from an
                  in-app browser such as Facebook,
                  Gmail, or Messenger.
                </p>
              </div>
            </li>

            <li>
              <span>2</span>
              <div>
                <strong>Tap the Share button</strong>
                <p>
                  Look for the square icon with an
                  upward-pointing arrow.
                </p>
              </div>
            </li>

            <li>
              <span>3</span>
              <div>
                <strong>
                  Choose Add to Home Screen
                </strong>
                <p>
                  You may need to scroll down in the
                  Share menu.
                </p>
              </div>
            </li>

            <li>
              <span>4</span>
              <div>
                <strong>Tap Add</strong>
                <p>
                  Speedy Scheduler will appear on your
                  home screen.
                </p>
              </div>
            </li>
          </ol>
        </section>
      )}

      {isAndroid && (
        <section className="install-card install-card--recommended">
          <div className="install-card__heading">
            <span aria-hidden="true">🤖</span>

            <div>
              <p className="home-card__eyebrow">
                Detected device
              </p>

              <h2>Install on Android</h2>
            </div>
          </div>

          {deferredPrompt ? (
            <div className="install-direct-option">
              <p>
                Your browser supports direct
                installation.
              </p>

              <button
                type="button"
                className="install-primary-button"
                onClick={installApp}
              >
                Install Speedy Scheduler
              </button>
            </div>
          ) : (
            <ol className="install-steps">
              <li>
                <span>1</span>
                <div>
                  <strong>
                    Open this page in Chrome
                  </strong>
                  <p>
                    Chrome or another supported
                    Chromium browser works best.
                  </p>
                </div>
              </li>

              <li>
                <span>2</span>
                <div>
                  <strong>Tap the three-dot menu</strong>
                  <p>
                    The menu is usually in the
                    upper-right corner.
                  </p>
                </div>
              </li>

              <li>
                <span>3</span>
                <div>
                  <strong>
                    Tap Install App or Add to Home
                    Screen
                  </strong>
                </div>
              </li>

              <li>
                <span>4</span>
                <div>
                  <strong>Confirm installation</strong>
                  <p>
                    The app will appear on your home
                    screen or in your app drawer.
                  </p>
                </div>
              </li>
            </ol>
          )}
        </section>
      )}

      {!isIOS && !isAndroid && (
        <section className="install-card">
          <div className="install-card__heading">
            <span aria-hidden="true">💻</span>

            <div>
              <p className="home-card__eyebrow">
                Desktop installation
              </p>

              <h2>Install on this computer</h2>
            </div>
          </div>

          {deferredPrompt ? (
            <button
              type="button"
              className="install-primary-button"
              onClick={installApp}
            >
              Install Speedy Scheduler
            </button>
          ) : (
            <p>
              Look for an install icon in your
              browser&apos;s address bar or open the
              browser menu and choose Install Speedy
              Scheduler.
            </p>
          )}
        </section>
      )}

      {!deferredPrompt &&
        !isIOS &&
        isChromeLike && (
          <section className="install-help">
            <h2>Install option not showing?</h2>

            <p>
              Make sure you are using the deployed
              HTTPS version of Speedy Scheduler and
              that the web app manifest and service
              worker loaded successfully.
            </p>
          </section>
        )}

      <section className="install-help">
        <h2>Having trouble?</h2>

        <p>
          Open the official Speedy Scheduler website
          directly in Safari on iPhone or Chrome on
          Android. Installation options may be hidden
          inside browsers built into email, social
          media, or messaging apps.
        </p>
      </section>
    </div>
  );
}

export default InstallPage;