import { put } from "redux-saga/effects.js"

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
