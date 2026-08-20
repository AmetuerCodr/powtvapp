export const VIDEO_CATEGORIES = [
  "Sermons & Teachings",
  "Wellness & Health",
  "Music & Worship",
  "Courses & Bible Study",
  "Shorts",
  "Guest Creators",
] as const;

export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

export function isVideoCategory(value: unknown): value is VideoCategory {
  return (
    typeof value === "string" &&
    VIDEO_CATEGORIES.includes(value as VideoCategory)
  );
}

export function normalizeSearchTerm(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}
