import { put } from "redux-saga/effects.js"

import waitFor from "./waitFor.js"

export default function* respondToSync(verb, stream, data = undefined) {
  const action = yield waitFor(`${verb} ${stream}`)
  const payload = { ...action }
  payload.type = stream

  const ret = {
    data: action.data,
    metadata: action,
  }

  if (data !== undefined) {
    payload.data = data
    yield put(payload)
  } else {
    ret.respond = function* answer(data, metadata) {
      payload.data = data
      payload.metadata = metadata
      yield put(payload)
    }
  }

  return ret
}
