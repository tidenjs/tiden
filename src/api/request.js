import { all, call, put, take } from "redux-saga/effects"

import getCallerFile from "../getCallerFile.js"
import getUniqueKey from "../getUniqueKey.js"

export default function request(verb, stream, data, metadata = {}) {
  const tag = getCallerFile()
  return _request(verb, stream, data, metadata, tag)
}

function* _request(verb, stream, data, metadata = {}, sender) {
  if (Array.isArray(verb)) {
    return yield all(
      verb.map((v) =>
        Array.isArray(v)
          ? call(_request, v[0], v[1], v[2], v[3], sender)
          : call(_request, v, null, null, null, sender)
      )
    )
  }

  // shorthand defaults to 'get'
  if (!stream && !data) {
    stream = verb
    verb = `get`
  }
  const key = getUniqueKey()

  const payload = { type: `${verb} ${stream}`, ...metadata, _: { sender } }
  if (data !== undefined) {
    payload.data = data
  }
  if (key !== undefined) {
    payload.key = key
  }
  yield put(payload)

  let timer

  try {
    timer = setTimeout(() => {
      console.warn(
        `Still waiting for response to '${verb} ${stream}', maybe other side crashed?`
      )
    }, 3000)

    const action = yield take((a) => a.key === key)

    if (action.error) {
      throw action.error
    }
    return action.data
  } finally {
    clearTimeout(timer)
  }
}
