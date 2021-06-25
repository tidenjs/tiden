import { put } from "redux-saga/effects.js"

export default function publish(type, data = null, extras = null) {
  const payload = { type }

  if (data !== undefined) {
    payload.data = data
  }

  if (extras) {
    Object.assign(payload, extras)
  }

  return put(payload)
}
