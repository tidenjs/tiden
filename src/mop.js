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

// For use with 'connect'. Requests, selects, and reduces data. Use same way as reselect's createSelector, but you may also provide assets in the form of strings.
export function createMutex() {
  let promise

  const ret = {
    *lock(actor) {
      while (promise) {
        yield promise
      }
      let res
      try {
        promise = new Promise((r) => (res = r))
        return yield actor()
      } finally {
        res()
        promise = null
      }
    },
  }

  return ret
}

export function link() {
  throw new Error(`deprecated`)
}

export function linkTo(obj, { target = `_blank` } = {}) {
  return {
    *onClick() {
      yield announce(`navigate`, obj)
    },
    href: generate(obj),
    target,
  }
}

// Convenience function for making concepts that are based on other concepts. Subscribes to changes and caches result, all automatic.
export function confluence(rivers, noun, arg1, arg2) {
  let constraints
  let actor
  if (arg2) {
    constraints = arg1
    actor = arg2
  } else {
    constraints = {}
    actor = arg1
  }

  const ret = fork(function* () {
    const cache = yield createCache()
    let hasFetched = false
    let assets

    for (const name of rivers) {
      yield listenFor(
        name,
        whenChanged(function* (data) {
          // only listen for changes after initial fetch
          if (hasFetched) {
            assets[rivers.indexOf(name)] = data
            cache.clear()
            // trigger re-fetch
            yield request(noun)
          }
        })
      )
    }

    function* execute() {
      if (!hasFetched) {
        assets = yield request(rivers)
        hasFetched = true
      }

      // wait for all constraints to clear
      let again = true
      while (again) {
        again = false
        for (const [i, river] of rivers.entries()) {
          if (constraints[river]) {
            if (!constraints[river](assets[i])) {
              // constraint failed, so we wait for the next one
              again = true
              yield waitFor(river)
            }
          }
        }
      }

      const ret = yield actor(...assets)

      return ret
    }

    yield respondTo(`get`, noun, cache(execute))

    yield respondTo(`invalidate`, noun, function* () {
      cache.clear()
      return yield request(noun)
    })

    yield respondTo(`clearcache`, noun, function* () {
      cache.clear()
    })
  })

  return ret
}
