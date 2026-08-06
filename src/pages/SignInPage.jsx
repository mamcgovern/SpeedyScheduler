import {
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";

function SignInPage() {
    async function signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();

            provider.setCustomParameters({
                prompt: "select_account",
            });

            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Full Google sign-in error:", error);

            const errorCode =
                error?.code ?? "No Firebase error code";

            const errorMessage =
                error?.message ??
                String(error) ??
                "Unknown sign-in error";

            window.alert(
                `Google sign-in failed.\n\n${errorCode}\n\n${errorMessage}`
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