export function formatLabel(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim().replace(/\\s+/g, ' ').replace(/\\b\\w/g, (letter) => letter.toUpperCase());
}
