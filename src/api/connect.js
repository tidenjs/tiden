import {
  all,
  call,
  cancel,
  delay,
  fork,
  put,
  take,
  takeEvery,
} from "redux-saga/effects.js"
import { createSelector } from "reselect"
import { eventChannel } from "redux-saga"

import { _request } from "./request.js"
import getCallerFile from "../getCallerFile.js"
import listenFor from "./listenFor.js"
import waitFor from "./waitFor.js"
import whenChanged from "./whenChanged.js"

let connectKey = 1

export default function* connect(
  el,
  selectors,
  { assets = [], onReady = null } = {}
) {
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
        dispatch({
          type: `error`,
          data: `An array was sent to 'connect', this is no longer allowed. Please use a selector instead. Caller was ${sender}`,
        })
        return undefined
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

  // this fixes a bug in redux-saga (an extreme corner case) when the next instruction after returning is a cancellation. Without delay, the task will hang.
  yield delay(1)

  return result
}

const boundSym = Symbol(`bound`)
function bound(value) {
  if (value) {
    value[boundSym] = true
  }
  return value
}

function createDispatcher(cb) {
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

function isGeneratorFunction(obj) {
  return (
    obj &&
    obj.prototype &&
    obj.prototype.next &&
    !!obj.prototype[Symbol.iterator]
  )
}
