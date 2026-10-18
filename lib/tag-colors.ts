const tagColors = [
  { color: "#7dd3fc", backgroundColor: "#0c4a6e66", borderColor: "#38bdf866" },
  { color: "#c4b5fd", backgroundColor: "#4c1d9566", borderColor: "#a78bfa66" },
  { color: "#6ee7b7", backgroundColor: "#064e3b66", borderColor: "#34d39966" },
  { color: "#fcd34d", backgroundColor: "#78350f66", borderColor: "#fbbf2466" },
  { color: "#f9a8d4", backgroundColor: "#83184366", borderColor: "#f472b666" },
  { color: "#67e8f9", backgroundColor: "#164e6366", borderColor: "#22d3ee66" },
  { color: "#fdba74", backgroundColor: "#7c2d1266", borderColor: "#fb923c66" },
  { color: "#a5b4fc", backgroundColor: "#312e8166", borderColor: "#818cf866" },
  { color: "#bef264", backgroundColor: "#36531466", borderColor: "#a3e63566" },
  { color: "#fda4af", backgroundColor: "#88133766", borderColor: "#fb718566" },
] as const;

// Derive the color from the tag itself, never its position in a card or list.
// The same label keeps its color across filtering, navigation and UI languages.
export function getTagStyle(tag: string) {
  const normalized = tag.trim().normalize("NFC").toLowerCase();
  let hash = 2166136261;
  for (const character of normalized) {
    hash = Math.imul(hash ^ character.codePointAt(0)!, 16777619);
  }
  return tagColors[(hash >>> 0) % tagColors.length];
}
