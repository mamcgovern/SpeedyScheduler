import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";

const weekendsCollection = collection(
  db,
  "weekends",
);

export function subscribeToWeekends(
  onChange,
  onError,
) {
  const weekendsQuery = query(
    weekendsCollection,
    orderBy("startDate"),
  );

  return onSnapshot(
    weekendsQuery,
    (snapshot) => {
      const weekends = snapshot.docs.map(
        (weekendDocument) => ({
          id: weekendDocument.id,
          ...weekendDocument.data(),
        }),
      );

      onChange(weekends);
    },
    onError,
  );
}

export function subscribeToWeekend(
  weekendId,
  onChange,
  onError,
) {
  if (!weekendId) {
    onChange(null);
    return () => {};
  }

  const weekendReference = doc(
    db,
    "weekends",
    weekendId,
  );

  return onSnapshot(
    weekendReference,
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }

      onChange({
        id: snapshot.id,
        ...snapshot.data(),
      });
    },
    onError,
  );
}

export async function createWeekend(
  weekendData,
) {
  const weekendReference = await addDoc(
    weekendsCollection,
    {
      title:
        weekendData.title ||
        "Untitled Weekend",

      subtitle:
        weekendData.subtitle || "",

      locationName:
        weekendData.locationName || "",

      locationAddress:
        weekendData.locationAddress || "",

      startDate:
        weekendData.startDate || "",

      endDate:
        weekendData.endDate || "",

      latitude:
        weekendData.latitude ?? null,

      longitude:
        weekendData.longitude ?? null,

      events:
        weekendData.events ?? [],

      selectedEventIds:
        weekendData.selectedEventIds ?? [],

      notes:
        weekendData.notes ?? "",

      checklist:
        weekendData.checklist ?? [],

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );

  return weekendReference.id;
}

export async function createWeekendWithId(
  weekendId,
  weekendData,
) {
  await setDoc(
    doc(db, "weekends", weekendId),
    {
      ...weekendData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );
}

export async function updateWeekend(
  weekendId,
  updates,
) {
  if (!weekendId) {
    throw new Error(
      "A weekend ID is required.",
    );
  }

  await updateDoc(
    doc(db, "weekends", weekendId),
    {
      ...updates,
      updatedAt: serverTimestamp(),
    },
  );
}

export async function deleteWeekend(
  weekendId,
) {
  if (!weekendId) {
    return;
  }

  await deleteDoc(
    doc(db, "weekends", weekendId),
  );
}