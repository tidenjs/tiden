export default function camelToSnake(str) {
  str = str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
  if (str.startsWith(`-`)) {
    str = str.slice(1)
  }
  return str
}
