import {
    doc,
    onSnapshot,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const SCHEDULE_ID = "iowa-2026";

const scheduleReference = doc(
    db,
    "sharedSchedules",
    SCHEDULE_ID
);

export function subscribeToSharedSchedule(
    onScheduleChange,
    onError
) {
    return onSnapshot(
        scheduleReference,
        (snapshot) => {
            if (!snapshot.exists()) {
                onScheduleChange(null);
                return;
            }

            onScheduleChange(snapshot.data());
        },
        onError
    );
}

export async function saveSelectedEventIds(
    selectedEventIds
) {
    await setDoc(
        scheduleReference,
        {
            selectedEventIds,
            updatedAt: serverTimestamp(),
        },
        {
            merge: true,
        }
    );
}

export async function saveFavoriteDrivers(
    favoriteDrivers
) {
    await setDoc(
        scheduleReference,
        {
            favoriteDrivers,
            updatedAt: serverTimestamp(),
        },
        {
            merge: true,
        }
    );
}