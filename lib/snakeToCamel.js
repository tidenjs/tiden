export default function snakeToCamel(str) {
  return str
    .split(`-`)
    .map((substr) => substr[0] + substr.slice(1))
    .join(``)
}
