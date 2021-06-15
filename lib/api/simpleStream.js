import { fork } from "redux-saga/effects.js"

import respondTo from "./respondTo.js"

export default function simpleStream(name, initialValue = null) {
  return fork(function* () {
    let state = initialValue
    yield respondTo(`set`, name, function* (data) {
      state = data
      return data
    })
    yield respondTo(`get`, name, function* () {
      return state
    })
  })
}
