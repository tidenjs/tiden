// Respond to calls made from other sagas using the 'request' method above.
//
// Requires all three parameters.
//
// E.g. respondTo('get', 'languages', function* () { return ['en', 'sv'] })

import { put, takeEvery } from "redux-saga/effects"

export function respondTo(verb, noun, actor) {
  if (typeof actor !== `function`) {
    const value = actor
    actor = function* () {
      return value
    }
  }

  return takeEvery(`${verb} ${noun}`, function* (action) {
    const payload = { ...action }
    payload.type = noun
    delete payload.data

    try {
      payload.data = yield actor(action.data, action)
      if (payload.data === undefined) {
        console.error(
          `respondTo(${verb} ${noun}): ${actor.name} returned undefined, which is an anti-pattern. If nothing should be returned then null should be returned`
        )
      }
    } catch (e) {
      payload.error = e
    }

    yield put(payload)
  })
}
