// merges one or more streams into one new stream. Earlier called confluence.
import { fork } from "redux-saga/effects.js"

import cache from "./cache.js"
import listenFor from "./listenFor.js"
import request from "./request.js"
import respondTo from "./respondTo.js"
import waitFor from "./waitFor.js"
import whenChanged from "./whenChanged.js"

export default function merge(streams, stream, arg1, arg2) {
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
    const cached = yield cache()
    let hasFetched = false
    let assets

    for (const name of streams) {
      yield listenFor(
        name,
        whenChanged(function* (data) {
          // only listen for changes after initial fetch
          if (hasFetched) {
            assets[streams.indexOf(name)] = data
            cached.clear()
            // trigger re-fetch
            yield request(stream)
          }
        })
      )
    }

    function* execute() {
      if (!hasFetched) {
        assets = yield request(streams)
        hasFetched = true
      }

      // wait for all constraints to clear
      let again = true
      while (again) {
        again = false
        for (const [i, stream] of streams.entries()) {
          if (constraints[stream]) {
            if (!constraints[stream](assets[i])) {
              // constraint failed, so we wait for the next one
              again = true
              yield waitFor(stream)
            }
          }
        }
      }

      const ret = yield actor(...assets)

      return ret
    }

    yield respondTo(`get`, stream, cached(execute))

    yield respondTo(`invalidate`, stream, function* () {
      assets = yield request(streams)
      cached.clear()
      return yield request(stream)
    })
  })

  return ret
}
