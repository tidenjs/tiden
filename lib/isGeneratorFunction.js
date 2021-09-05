export default function isGeneratorFunction(obj) {
  return (
    obj &&
    obj.prototype &&
    obj.prototype.next &&
    !!obj.prototype[Symbol.iterator]
  )
}
