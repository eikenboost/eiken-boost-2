"use client";

import { useSyncExternalStore } from "react";
import type { AssessmentResult } from "@/lib/types";
import { mockProfile, sampleAssessment } from "@/lib/mock-data";

const PROFILE_KEY = "eiken-boost-2-profile";
const ASSESSMENT_KEY = "eiken-boost-2-assessment";

type StoredProfile = typeof mockProfile;

export function getStoredProfile(): StoredProfile {
  if (typeof window === "undefined") return mockProfile;
  const raw = window.localStorage.getItem(PROFILE_KEY);
  return raw ? { ...mockProfile, ...JSON.parse(raw) } : mockProfile;
}

export function saveStoredProfile(nextProfile: Partial<StoredProfile>) {
  if (typeof window === "undefined") return;
  const merged = { ...getStoredProfile(), ...nextProfile };
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
  notifyAppStateChange();
}

export function getStoredAssessment(): AssessmentResult {
  if (typeof window === "undefined") return sampleAssessment;
  const raw = window.localStorage.getItem(ASSESSMENT_KEY);
  return raw ? { ...sampleAssessment, ...JSON.parse(raw) } : sampleAssessment;
}

export function saveStoredAssessment(result: AssessmentResult) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(result));
  notifyAppStateChange();
}

// --- tiny pub/sub so components can subscribe to localStorage-backed state
// (mirrors the pattern already used in lib/study-flow.ts) ---

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribeAppState(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyAppStateChange() {
  listeners.forEach((listener) => listener());
}

// --- Hydration-safe React bindings (useSyncExternalStore) -------------------
// These pages/hooks are used from statically pre-rendered routes, so the
// server always renders with the neutral mock defaults. Reading localStorage
// synchronously during the first client render (e.g.
// `useState(() => getStoredProfile())`) would make that very first client
// render diverge from the server-rendered HTML whenever the user's real data
// differs from the mock defaults — React reports this as a hydration
// mismatch. `useSyncExternalStore` solves this correctly: `getServerSnapshot`
// always returns the same default the server used, and React automatically
// re-renders with the real client snapshot right after hydration, with no
// manual `setState`-in-`useEffect` needed.

// Cache snapshots so getSnapshot returns a stable reference between renders
// when the underlying data hasn't changed (required to avoid an infinite
// re-render loop with useSyncExternalStore).
let cachedProfileKey = "";
let cachedProfile: StoredProfile = mockProfile;

function getProfileSnapshot(): StoredProfile {
  const profile = getStoredProfile();
  const key = JSON.stringify(profile);
  if (key !== cachedProfileKey) {
    cachedProfileKey = key;
    cachedProfile = profile;
  }
  return cachedProfile;
}

function getProfileServerSnapshot(): StoredProfile {
  return mockProfile;
}

let cachedAssessmentKey = "";
let cachedAssessment: AssessmentResult = sampleAssessment;

function getAssessmentSnapshot(): AssessmentResult {
  const assessment = getStoredAssessment();
  const key = JSON.stringify(assessment);
  if (key !== cachedAssessmentKey) {
    cachedAssessmentKey = key;
    cachedAssessment = assessment;
  }
  return cachedAssessment;
}

function getAssessmentServerSnapshot(): AssessmentResult {
  return sampleAssessment;
}

/** Hydration-safe profile reader + updater. Returns the mock profile until after mount. */
export function useStoredProfile(): [StoredProfile, (next: Partial<StoredProfile>) => void] {
  const profile = useSyncExternalStore(subscribeAppState, getProfileSnapshot, getProfileServerSnapshot);
  return [profile, saveStoredProfile];
}

/** Hydration-safe assessment reader. Returns the sample assessment until after mount. */
export function useStoredAssessment(): AssessmentResult {
  return useSyncExternalStore(subscribeAppState, getAssessmentSnapshot, getAssessmentServerSnapshot);
}
