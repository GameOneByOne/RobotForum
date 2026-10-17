const adjectives = [
  "脆皮",
  "快乐",
  "好奇",
  "勇敢",
  "温柔",
  "机灵",
  "悠闲",
  "闪亮",
  "认真",
  "圆润",
  "活泼",
  "神秘",
];
const nouns = [
  "香蕉",
  "菠萝",
  "熊猫",
  "企鹅",
  "橘子",
  "土豆",
  "海豹",
  "松鼠",
  "西瓜",
  "云朵",
  "星星",
  "机器人",
];
const storageKey = "robot-forum:guest-name";
let cachedName: string | undefined;

const englishAdjectives = [
  "Crispy",
  "Happy",
  "Curious",
  "Brave",
  "Gentle",
  "Clever",
  "Relaxed",
  "Shiny",
  "Focused",
  "Round",
  "Lively",
  "Mysterious",
];
const englishNouns = [
  "Banana",
  "Pineapple",
  "Panda",
  "Penguin",
  "Orange",
  "Potato",
  "Seal",
  "Squirrel",
  "Watermelon",
  "Cloud",
  "Star",
  "Robot",
];

// Localize only generated guest identities; the stored identity stays stable.
export function displayGuestName(name: string, locale: "zh" | "en"): string {
  if (locale === "zh") return name;
  const [adjective, noun] = name.split("的");
  const left = adjectives.indexOf(adjective);
  const right = nouns.indexOf(noun);
  return left >= 0 && right >= 0
    ? `${englishAdjectives[left]} ${englishNouns[right]}`
    : name === "游客"
      ? "Guest"
      : name;
}

// Called on interaction so random browser-only state never affects hydration.
export function getGuestName(): string {
  if (cachedName) return cachedName;

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (
      saved &&
      adjectives.some((word) =>
        nouns.some((noun) => saved === `${word}的${noun}`),
      )
    ) {
      cachedName = saved;
      return saved;
    }
  } catch {
    // Keep an in-memory name when browser storage is unavailable.
  }

  cachedName = `${adjectives[Math.floor(Math.random() * adjectives.length)]}的${nouns[Math.floor(Math.random() * nouns.length)]}`;
  try {
    window.localStorage.setItem(storageKey, cachedName);
  } catch {
    // The menu remains usable in browsers that block storage.
  }
  return cachedName;
}
