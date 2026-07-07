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
}

export function getStoredAssessment(): AssessmentResult {
  if (typeof window === "undefined") return sampleAssessment;
  const raw = window.localStorage.getItem(ASSESSMENT_KEY);
  return raw ? { ...sampleAssessment, ...JSON.parse(raw) } : sampleAssessment;
}

export function saveStoredAssessment(result: AssessmentResult) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(result));
}
