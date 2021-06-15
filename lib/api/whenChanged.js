export default function whenChanged(matcher, targetFunction) {
  if (!targetFunction) {
    targetFunction = matcher
    matcher = (d) => d
  }
  let previousValue = undefined

  return function* (data, metadata) {
    const value = matcher(data, metadata)
    if (value !== previousValue) {
      previousValue = value
      yield targetFunction(data, metadata)
    }
  }
}
