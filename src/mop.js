//
// There are few experimental methods in this file.
// If unsure, consider using only these:
//
// request
// respondTo
// connectedElement
// createSimpleConcept
// announce
// listenFor
// waitFor
// once
// whenChanged

import {
  all,
  call,
  cancel,
  delay,
  fork,
  put,
  race,
  take,
  takeEvery,
  takeLeading,
  takeMaybe,
} from "./import/redux-saga/effects.js"
import { createSelector } from "./import/reselect.js"
import { eventChannel } from "./import/redux-saga.js"
import { generate } from "./routing.js"

export function linkTo(obj, { target = `_blank` } = {}) {
  return {
    *onClick() {
      yield announce(`navigate`, obj)
    },
    href: generate(obj),
    target,
  }
}
