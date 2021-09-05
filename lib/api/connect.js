import { all, call, cancel, delay, fork } from "redux-saga/effects.js"
import { createSelector } from "https://cdn.jsdelivr.net/npm/reselect@4.0.0/es/index.js"

import { _request } from "./request.js"
import bridge from "../bridge.js"
import getCallerFile from "../getCallerFile.js"
import isGeneratorFunction from "../isGeneratorFunction.js"
import subscribe from "./subscribe.js"
import waitFor from "./waitFor.js"
import whenChanged from "./whenChanged.js"

let connectKey = 1

export default function* connect(
  el,
  selectors,
  { assets = [], onReady = null } = {}
) {
  for (const [key, value] of Object.entries(selectors)) {
    if (value.map) {
      throw new Error(
        `An array was used 'connect({${key}})', this is no longer allowed. Please use a selector instead.`
      )
    }
  }

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
    const { run, bind, dispatch } = bridge()
    yield fork(run)

    // filter out falsies and duplicates
    assets = [...new Set(assets.filter((t) => t))]

    let state = {}

    function publish(type, data = null, metadata = null) {
      const payload = { type, _: { sender } }
      if (data !== undefined) {
        payload.data = data
      }
      if (metadata) {
        Object.assign(payload, metadata)
      }
      dispatch(payload)
    }
    state.bind = bind
    state.publish = (...args) => {
      console.warn(
        `'publish' has been deprecated. Use generator functions instead.`
      )
      publish(...args)
    }
    state.announce = (...args) => {
      console.warn(
        `'announce' has been deprecated. Use generator functions instead.`
      )
      return publish(...args)
    }

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
      yield subscribe(
        asset,
        whenChanged(function* (data) {
          invalidAssets.delete(asset) // we have data for this now
          state = Object.freeze({ ...state, [asset]: Object.freeze(data) })
          yield setProperties()
        })
      )

      yield subscribe(`invalidate ${asset}`, function* () {
        invalidAssets.add(asset)
      })
    }

    // set derived properties only if changed
    function* setProperties() {
      if (invalidAssets.size > 0) {
        // do not set properties if any of the source data is invalid
        return
      }
      for (const k of propertyNames) {
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
