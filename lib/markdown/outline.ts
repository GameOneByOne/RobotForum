export type ReadingHeading = {
  title: string;
  level: number;
  line: number;
  id: string;
};

// Ignore headings inside examples, including both Markdown fence styles.
export function readingOutline(source: string, offset = 0): ReadingHeading[] {
  const headings: ReadingHeading[] = [];
  let fence: { char: string; length: number } | null = null;
  let tabs = false;
  let math = false;
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    const marker = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (marker) {
      if (!fence) fence = { char: marker[1][0], length: marker[1].length };
      else if (
        marker[1][0] === fence.char &&
        marker[1].length >= fence.length &&
        !marker[2].trim()
      )
        fence = null;
      return;
    }
    if (fence) return;
    if (/^\s*\$\$\s*$/.test(line)) {
      math = !math;
      return;
    }
    if (math) return;
    if (/^:::code-tabs\s*$/.test(line)) {
      tabs = true;
      return;
    }
    if (tabs) {
      if (/^:::\s*$/.test(line)) tabs = false;
      return;
    }
    const atx = /^\s{0,3}(#{1,6})\s+(.+?)(?:\s+#+\s*)?$/.exec(line);
    const setext =
      index > 0 && lines[index - 1].trim() && /^\s{0,3}(=+|-+)\s*$/.exec(line);
    if (!atx && !setext) return;
    const title = (atx ? atx[2] : lines[index - 1])
      .replace(/!\[([^\]]*)\]\([^)]*\)|\[([^\]]+)\]\([^)]*\)/g, "$1$2")
      .replace(/[*_`]/g, "")
      .trim();
    headings.push({
      title,
      level: atx ? atx[1].length : setext && setext[1][0] === "=" ? 1 : 2,
      line: atx ? index + 1 : index,
      id: `reading-heading-${offset + headings.length + 1}`,
    });
  });
  return headings;
}
