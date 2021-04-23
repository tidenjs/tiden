import { takeEvery } from "redux-saga/effects.js"

export default function listenFor(...args) {
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
