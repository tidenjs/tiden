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

// REQUEST
//
// request data from other sagas. Polymorphic function.
//
// Usage:
// it = yield request(noun)       | Makes a 'get' request for noun.
// it = yield request(verb, noun) | Makes a verb request for noun.
// it = yield request(verb, noun, data)         | As above, but pass data value as well
// it = yield request(verb, noun, data, extras) | As above, merge any keys in extras to action
//
// Additionally, an array may be passed in to request several actions in parallel
// array = request(array[noun])  | Will call request for each noun
// array = request(array[array]) | Will spread the inner array for calls with request
//
// EXAMPLES
//
// # Get token
// const token = request(`token`)
//
// # Get token and languages:
// const [token, languages] = yield request([`token`, `languages`])
//
// # validate token
// yield request(`validate`, `token`)
//
// # Set language
// yield request(`set`, `language`, `en`)
//
// # Update user
// yield request(`update`, `user`, {name: `foo`}, {id: `123`})
//
// # Perform several actions in parallel
// const [_, user] = yield request([
//   [`validate`, `token`],
//   [`create`, `user`, {name: `bar`}]
// ])

export function takeEveryCreate(noun, actor) {
  return respondTo(`create`, noun, actor)
}

export function takeEveryUpdate(noun, actor) {
  return respondTo(`update`, noun, actor)
}

// similar to 'respondTo', but waits and returns with callback
export function* respondToSync(verb, noun, data = undefined) {
  const action = yield waitFor(`${verb} ${noun}`)
  const payload = { ...action }
  payload.type = noun

  const ret = {
    data: action.data,
    metadata: action,
  }

  if (data !== undefined) {
    payload.data = data
    yield put(payload)
  } else {
    ret.respond = function* answer(data) {
      payload.data = data
      yield put(payload)
    }
  }

  return ret
}

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

// NOTE: This function is deprecated, use 'whenChanged' instead
//
// Usage yield takeEvery(`something`, unique(function*(data) {}))
//
// Only changes in action.data will be let through. Note: The target function does not get the whole action as parameter
export function unique(targetFunction) {
  let cache = undefined

  return function* (action) {
    if (action.data !== undefined && action.data !== cache) {
      cache = action.data
      yield targetFunction(cache)
    }
  }
}

// NOTE: This function is deprecated, use 'whenChanged' instead
//
// Usage yield takeEvery(`something`, distinct(matcher, targetFunction))
//
// matcher: A function that takes an action and returns a value from it. Defaults to action => action.data
//
// targetFunction: A function that will receive the action only if value from matcher has changed
//
export function distinct(matcher, targetFunction) {
  if (!targetFunction) {
    targetFunction = matcher
    matcher = (action) => action.data
  }
  let previousValue = undefined

  return function* (action) {
    const value = matcher(action)
    if (value !== previousValue) {
      previousValue = value
      yield targetFunction(action)
    }
  }
}

// Usage yield listenFor(`something`, whenChanged(d => d.id, targetFunction))
//
// matcher(data, metadata): return a value to determine uniqueness by.
//
// targetFunction(data, metadata): A function that will be called only when value from matcher has changed.
//
export function whenChanged(matcher, targetFunction) {
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

// DEPRECATED: Use generator functions instead (with 'bind' if nested)
//
// target    | a DOM element
// sourceKey | The key to set a function callback on (target.x)
// metadata  | Extra data forwarded to the listener
// type      | The type of the action to dispatch ({type: "x"})
export function pipe(target, sourceKey, metadata, type) {
  if (!target) {
    // if target doesn't exist, assume this should never be called
    return
  }

  return fork(function* () {
    if (!sourceKey) {
      throw new Error(`Missing parameter 'sourceKey'`)
    }
    if (!type) {
      type = sourceKey
    }

    const channel = eventChannel((emitter) => {
      target[sourceKey] = (arg) => {
        emitter({ data: arg })
      }

      return () => {
        target[sourceKey] = null
      }
    })

    yield takeEvery(channel, function* ({ data }) {
      const action = { type, data }
      if (metadata !== undefined) {
        action.metadata = metadata
      }
      yield put(action)
    })

    try {
      yield takeMaybe(`forever`)
    } finally {
      channel.close()
    }
  })
}

// definition | A key-value object where each key represents a type to be listening to.
//
// Only one saga is allowed to continue, the one that was called first
export function* takeOne(definition) {
  const types = Object.keys(definition)
  const action = yield take(types)
  yield definition[action.type](action)
}

export function createDispatcher(cb) {
  let dispatch
  const channel = eventChannel((emitter) => {
    let open = true
    dispatch = (...args) => {
      if (open) {
        emitter(...args)
      } else {
        throw new Error(
          `Using dispatch after channel has been closed is a no-op.`
        )
      }
    }

    return () => {
      open = false
    }
  })

  function* worker() {
    try {
      while (true) {
        const action = yield take(channel)
        yield put(action)
      }
    } finally {
      channel.close()
    }
  }

  return [dispatch, worker]
}

/*
 * Helper function to derive DOM element properties from Saga MOP communication.
 *
 * NOTE: This has to be run with yield* or get stuck forever.
 *
 * el: the DOM element to set properties to
 * from: the saga concepts to listen for
 * to: an object with keys mapped to properties. Values are functions that take state and returns value to use for property. Ideally, this would be a selector.
 * tail: Any function*(el) that also needs to set properties on given element.
 */
let connectKey = 1
export function* connect(el, selectors, { assets = [], onReady = null } = {}) {
  selectors = { ...selectors } // we'll modify these, so make a copy first

  for (const s of Object.values(selectors)) {
    if (s && s.assets) {
      for (const asset of s.assets) {
        assets.push(asset)
      }
    }
  }

  const myKey = connectKey++
  const self = yield fork(function* () {
    const sender = getCallerFile()

    // filter out falsies and duplicates
    assets = [...new Set(assets.filter((t) => t))]

    let state = {}

    const [dispatch, worker] = createDispatcher()
    yield fork(worker)

    function announce(type, data = null, metadata = null) {
      const payload = { type, _: { sender } }
      if (data !== undefined) {
        payload.data = data
      }
      if (metadata) {
        Object.assign(payload, metadata)
      }
      dispatch(payload)
    }
    state.announce = announce

    const bindvars = {
      counter: 0,
      name: ``,
    }
    state.bind = (thing) => {
      if (!thing) {
        return thing
      } else if (thing[boundSym]) {
        // already bound, so just return it
        return thing
      } else if (thing.call) {
        const func = thing
        const name = `${bindvars.name}[${bindvars.counter++}]`
        repository[name] = func
        const ret = (...args) =>
          state.announce(name, args, {
            connectKey: myKey,
          })

        Object.defineProperty(ret, `length`, { value: thing.length })

        ret.toString = func.toString.bind(func)
        return bound(ret)
      } else if (thing.map) {
        return thing.map(state.bind)
      } else if (typeof thing === `object`) {
        let newThing = thing
        for (const k of Object.keys(thing)) {
          const v = thing[k]
          const bindVal = state.bind(v)
          if (bindVal !== v) {
            if (newThing === thing) {
              // create a new object only when something has changed
              newThing = { ...thing }
            }
            newThing[k] = bindVal
          }
        }
        return newThing
      } else {
        return thing
      }
    }

    const repository = {}
    window.r = repository
    const propertyNames = Object.keys(selectors).filter((k) => {
      const val = selectors[k]
      if (isGeneratorFunction(val) || typeof val !== `function`) {
        const staticValue = state.bind(val)
        selectors[k] = () => staticValue
      }
      return true
    })

    // initial fetch
    Object.assign(
      state,
      yield all(
        assets.reduce((promises, asset) => {
          promises[asset] = call(_request, asset, null, null, null, sender)
          return promises
        }, {})
      )
    )

    state.dispatch = function () {
      throw new Error(`dispatch is deprecated`)
    }

    const invalidAssets = new Set()

    // listen for changes
    for (const asset of assets) {
      yield listenFor(
        asset,
        whenChanged(function* (data) {
          invalidAssets.delete(asset) // we have data for this now
          state = Object.freeze({ ...state, [asset]: Object.freeze(data) })
          yield setProperties()
        })
      )

      yield listenFor(`invalidate ${asset}`, function* () {
        invalidAssets.add(asset)
      })
    }

    const propertyFunctionsSaga = yield takeEvery(
      (action) => action.connectKey === myKey,
      function* (action) {
        if (repository[action.type]) {
          try {
            const func = repository[action.type]
            const result = yield call(func, ...action.data, state)
            if (result !== undefined) {
              yield put({
                type: `connectResult`,
                data: result,
                connectKey: myKey,
              })
            }
          } catch (e) {
            console.error(`Error in callback ${action.type}\n\n`, e)
          }
        } else {
          console.error(
            new Error(
              `Could not find associated connect callback function for ${action.type}`
            )
          )
        }
      }
    )

    // set derived properties only if changed
    function* setProperties() {
      if (invalidAssets.size > 0) {
        // do not set properties if any of the source data is invalid
        return
      }
      for (const k of propertyNames) {
        bindvars.counter = 0
        bindvars.name = `${el.tagName.toLowerCase()}.${k}`
        let val
        try {
          val = selectors[k](state)
        } catch (e) {
          console.error(
            `Error setting ${el.tagName.toLowerCase()}.${k}\n\n${e.stack}`
          )
        }
        if (val !== el[k]) {
          el[k] = val
        }
      }
    }

    yield setProperties()

    el.isReady = true
    if (onReady) {
      yield onReady()
    }
  })

  const result = (yield waitFor(
    (action) => action.type === `connectResult` && action.connectKey === myKey
  )).data
  yield cancel(self)

  return result
}

// legacy signature of 'connect' which is non-blocking
export function* connectedElement(el, from, to, tail = []) {
  yield fork(connect, el, to, { assets: from, tail })
}

const boundSym = Symbol(`bound`)
export function bound(value) {
  if (value) {
    value[boundSym] = true
  }
  return value
}

// sets up a very basic concept that only listens to 'get' and 'set'
export function createSimpleConcept(name, initialValue) {
  return fork(_createLocalConcept, name, initialValue)
}
function* _createLocalConcept(noun, initialValue) {
  let state = initialValue
  yield takeEvery(`set ${noun}`, function* ({ data, key }) {
    state = data
    yield put({ type: noun, data, key })
  })
  yield takeEveryGet(noun, function* () {
    return state
  })
}

function isGeneratorFunction(obj) {
  return (
    obj &&
    obj.prototype &&
    obj.prototype.next &&
    !!obj.prototype[Symbol.iterator]
  )
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
export function announce(type, data = null, extras = null) {
  const payload = { type }

  if (data !== undefined) {
    payload.data = data
  }

  if (extras) {
    Object.assign(payload, extras)
  }

  return put(payload)
}

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
export function listenFor(...args) {
  let arg, actor
  if (args.length === 3) {
    arg = `${args[0]} ${args[1]}`
    actor = args[2]
  } else {
    arg = args[0]
    actor = args[1]
  }
  return takeEvery(arg, function* (action) {
    const extras = { ...action }
    delete extras.data
    yield actor(action.data, extras)
  })
}

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
export function s(...args) {
  const assets = []
  const selectors = []

  // if last argument is a function then it is the reducer to be used. If not,
  // its assumed to be a string pointing to the asset that should be returned
  const lastval = args[args.length - 1]
  const func = lastval && lastval.call ? args.pop() : (s) => s

  for (const arg of args) {
    if (typeof arg === `string`) {
      if (arg === `bind`) {
        throw new Error(`bind is deprecated`)
      }
      assets.push(arg)
      selectors.push((s) => s[arg])
    } else {
      if (arg.assets) {
        for (const a of arg.assets) {
          assets.push(a)
        }
      }
      selectors.push(arg)
    }
  }

  const s = createSelector(
    ...selectors,
    (s) => s.bind,
    (...args) => {
      const bind = args.pop()
      const ret = func(...args)
      return bind(ret)
    }
  )
  s.assets = assets

  return s
}

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
