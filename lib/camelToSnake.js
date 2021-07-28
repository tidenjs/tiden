export default function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}
