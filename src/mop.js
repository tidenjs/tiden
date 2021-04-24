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

let uniqueKey = 0

export function takeEveryGet(noun, actor) {
  return takeXGet(takeEvery, noun, actor)
}

export function takeLeadingGet(noun, actor) {
  return takeXGet(takeLeading, noun, actor)
}

function takeXGet(func, noun, actor) {
  return takeEvery(`get ${noun}`, function* (action) {
    try {
      yield put({
        ...action,
        type: noun,
        key: action.key,
        data: yield actor(action),
      })
    } catch (e) {
      yield put({
        ...action,
        type: noun,
        key: action.key,
        error: e,
      })
    }
  })
}

function getCallerFile() {
  const old = Error.prepareStackTrace

  try {
    Error.prepareStackTrace = function (err, stack) {
      return stack
    }

    const filenames = new Error().stack.map((it) => it.getFileName())

    const caller = filenames.find(
      (name) => name !== filenames[0] && name && !name.includes(`redux-saga`)
    )

    if (caller) {
      return caller
    }
  } catch (err) {
  } finally {
    Error.prepareStackTrace = old
  }
  return undefined
}

// a wrapper around redux-saga `put` to avoid needing to import it directly from there

// a wrapper with slighlty different signature around redux-saga `take` to avoid needing to import it directly from there
export function* waitFor(arg, matcher) {
  let result
  do {
    result = yield take(arg)
  } while (matcher && !matcher(result.data, result))

  if (result.error) {
    throw result.error
  }
  return result
}

// a wrapper with slightly different signature around redux-saga `takeEvery` to avoid needing to import it directly from there

// export common redux-saga methods
export { fork, cancel, all, race }

// caching directive. Calls actor function only on first request, otherwise return saved data
export function once(actor) {
  return createCache()(actor)
}

// General-purpose caching. If endpoint can handle various kinds of resources, then provide a keyfunc(data, metadata) that returns an identifier pointing to the cache.
// Returns a function that can be used with respondTo and which has a clear(key) function for resetting the cache.
// If key is omitted then the default cache will be used for all data.
//
// Usage (single resource):
// const cache = Cache()
//
// yield respondTo(`get`, `resource`, cache(function*(data, metadata) {
//   return 'hello world'
// }))
//
// yield respondTo(`invalidate`, `resource`, function*(data, metadata) {
//   cache.clear()
//   return true
// })
//
// Usage (multiple resources):
// const cache = Cache((data, metadata) => metadata.id)
//
// yield respondTo(`get`, `resource`, cache(function*(data, metadata) {
//   return 'hello, you are number ' + metadata.id
// }))
//
// yield respondTo(`invalidate`, `resource`, function*(data, metadata) {
//   cache.clear() // clears all cache
//   cache.clear(4) // clears only cache with id 4
//   return true
// })
export function createCache(keyFunc) {
  let cache = {}

  if (!keyFunc) {
    keyFunc = () => `default`
  }

  const individualCache = (actor) => {
    let promise = {}
    return function* (data, metadata) {
      const key = keyFunc(data, metadata)
      if (cache[key] !== undefined) {
        return cache[key]
      } else if (promise[key]) {
        const val = yield promise[key]
        return val
      } else {
        let res
        promise[key] = new Promise((r) => {
          res = r
        })
        delete metadata.data
        const val = yield actor(data, metadata)
        if (!val || !val[noCacheSymbol]) {
          cache[key] = val
        }
        res(val)
        delete promise[key]
        return val
      }
    }
  }

  individualCache.get = (data, metadata = {}) => {
    const key = keyFunc(data, metadata)
    if (cache[key] !== undefined) {
      return cache[key]
    }
  }

  individualCache.clear = (keyOrFunc) => {
    if (!keyOrFunc) {
      cache = {}
    } else if (typeof keyOrFunc === `function`) {
      Object.keys(cache).forEach((k) => {
        if (keyOrFunc(k)) {
          delete cache[k]
        }
      })
    } else {
      delete cache[keyOrFunc]
    }
  }

  return individualCache
}
export const noCacheSymbol = Symbol(`noCache`)

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
