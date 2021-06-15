import { take } from "redux-saga/effects.js"

export default function* waitFor(arg, matcher) {
  let result
  do {
    result = yield take(arg)
  } while (matcher && !matcher(result.data, result))

  if (result.error) {
    throw result.error
  }
  return result
}
