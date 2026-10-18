import profile from "@/content/profile.json";
import research from "@/content/research.json";
import media from "@/content/media.json";
import speaking from "@/content/speaking.json";
import cv from "@/content/cv.json";
import site from "@/content/site.json";

export type ResearchItem = (typeof research)[number];
export type MediaItem = (typeof media)[number];

export { profile, research, media, speaking, cv, site };

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2025-05" becomes "May 2025". */
export function formatMonth(date: string) {
  const [year, month] = date.split("-");
  const name = months[Number(month) - 1];
  return name ? `${name} ${year}` : year;
}

export const studyMailto = `mailto:${profile.email}?subject=${encodeURIComponent("Taking part in a study")}`;
