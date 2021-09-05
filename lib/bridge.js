import { call, put, take, takeEvery } from "redux-saga/effects.js"
import { eventChannel } from "redux-saga"

const boundSym = Symbol(`bound`)
let key = 1

function bound(value) {
  if (value) {
    value[boundSym] = true
  }
  return value
}

export default function propertyBridge() {
  const myKey = key++
  const repository = {}
  const [dispatch, worker] = createDispatcher()
  let counter = 0

  function bind(thing, meaningfulName) {
    if (!thing) {
      return thing
    } else if (thing[boundSym]) {
      // already bound, so just return it
      return thing
    } else if (thing.call) {
      const func = thing
      const name = `callback(${meaningfulName}-${counter++})`
      repository[name] = func
      const ret = (...args) => {
        dispatch({ type: name, data: args, bridgeKey: myKey })
      }

      Object.defineProperty(ret, `length`, { value: thing.length })

      ret.toString = func.toString.bind(func)
      return bound(ret)
    } else if (thing.map) {
      return thing.map((it) => bind(it, meaningfulName))
    } else if (typeof thing === `object`) {
      let newThing = thing
      for (const k of Object.keys(thing)) {
        const v = thing[k]
        const bindVal = bind(v, meaningfulName)
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

  return {
    *run() {
      const propertyFunctionsSaga = yield takeEvery(
        (action) => action.bridgeKey === myKey,
        function* (action) {
          if (repository[action.type]) {
            try {
              const func = repository[action.type]
              const result = yield call(func, ...action.data)
              if (result !== undefined) {
                yield put({
                  type: `connectResult`,
                  data: result,
                  bridgeKey: myKey,
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

      yield worker()
    },
    bind,
    dispatch,
  }
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
