export const tagColorClasses = [
  "bg-[#d92d20] text-white",
  "bg-[#24706f] text-white",
  "bg-[#f79009] text-white",
  "bg-[#1570ef] text-white",
  "bg-[#7a2eaf] text-white",
  "bg-[#c11574] text-white",
];

export function getTagColorClass(index: number) {
  return tagColorClasses[index % tagColorClasses.length];
}
