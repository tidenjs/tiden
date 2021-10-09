import { call } from "redux-saga/effects.js"
import { eventChannel } from "redux-saga"
import { publish, respondTo, stream, waitFor } from "tiden"
import hmr from "tiden/lib/api/hmr.js"

import explore from "../../explore.js"

export default stream(`parts`, function* parts() {
  let parts

  yield respondTo(`get`, `parts`, function* () {
    if (!parts) {
      parts = yield explore()
    }

    return parts
  })

  const channel = eventChannel((dispatch) => {
    let cleanup
    cleanup = hmr((path) => {
      const changedPart = parts.find((it) => Object.values(it).includes(path))

      if (changedPart) {
        dispatch(changedPart.id)
      }
    })

    return cleanup
  })

  while (true) {
    const partId = yield waitFor(channel)

    const newParts = yield explore()
    const newPart = newParts.find((it) => it.id === partId)

    if (newPart) {
      // ensure only changed part is replaced, keep all old objects, and return new array
      // this is to make sure that object equality is maintained for unchanged entries
      const result = []
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].id === newPart.id) {
          result[i] = newPart
        } else {
          result[i] = parts[i]
        }
      }
      parts = result
      yield publish(`parts`, parts)
    }
  }
})
