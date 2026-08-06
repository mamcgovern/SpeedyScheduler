import {
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";

function SignInPage() {
    async function signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();

            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google sign-in failed:", error);

            alert(
                "Google sign-in could not be completed. Please try again."
            );
        }
    }

    return (
        <main className="sign-in-page">
            <section className="sign-in-card">
                <span
                    className="sign-in-card__flag"
                    aria-hidden="true"
                >
                    🏁
                </span>

                <p className="page-heading__eyebrow">
                    Shared race weekend planner
                </p>

                <h1>Speedy Scheduler</h1>

                <p>
                    Sign in to view and update your shared
                    race weekend schedule.
                </p>

                <button
                    type="button"
                    onClick={signInWithGoogle}
                >
                    Continue with Google
                </button>
            </section>
        </main>
    );
}

export default SignInPage;