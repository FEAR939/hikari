const date = new Date();
export const currentSeason = ["WINTER", "SPRING", "SUMMER", "FALL"][
  Math.floor((date.getMonth() / 12) * 4) % 4
] as "WINTER" | "SPRING" | "SUMMER" | "FALL";
export const currentYear = date.getFullYear();
export const nextSeason = ["WINTER", "SPRING", "SUMMER", "FALL"][
  Math.floor(((date.getMonth() + 3) / 12) * 4) % 4
] as "WINTER" | "SPRING" | "SUMMER" | "FALL";
export const nextYear = date.getFullYear() + (nextSeason === "WINTER" ? 1 : 0);
export const lastSeason = ["WINTER", "SPRING", "SUMMER", "FALL"].at(
  Math.floor(((date.getMonth() - 3) / 12) * 4) % 4,
) as "WINTER" | "SPRING" | "SUMMER" | "FALL";
export const lastYear = date.getFullYear() - (lastSeason === "FALL" ? 1 : 0);
