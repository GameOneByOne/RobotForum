export const tagColorClasses = ["border border-line bg-raised text-secondary"];
export function getTagColorClass(index: number) {
  return tagColorClasses[index % tagColorClasses.length];
}
