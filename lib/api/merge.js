// merges one or more streams into one new stream. Earlier called confluence.
import { fork, call, all } from "redux-saga/effects.js"

import cache from "./cache.js"
import subscribe from "./subscribe.js"
import request from "./request.js"
import respondTo from "./respondTo.js"
import waitFor from "./waitFor.js"
import whenChanged from "./whenChanged.js"

export default function merge(streams, stream, actor) {
  const task = fork(function* () {
    const cached = yield cache()
    let hasFetched = false
    let assets = Array.from({ length: streams.length }, () => undefined)
    let resolveNewAsset
    let waitForNewAsset = new Promise((res) => {
      resolveNewAsset = res
    })

    for (const [index, name] of streams.entries()) {
      yield subscribe(
        name,
        whenChanged(function* (data) {
          // only listen for changes after initial fetch
          if (hasFetched) {
            assets[index] = data
            cached.clear()
            resolveNewAsset()
            // trigger re-fetch
            yield request(stream)
          }
        })
      )
    }

    function* execute() {
      if (!hasFetched) {
        hasFetched = true

        // request all resources so that we block until all are available.
        // Note that if there are race conditions here, the subscribe fork above will
        // overwrite the entry in assets. This is per design.
        yield all(
          streams.map((r, i) =>
            call(function* () {
              assets[i] = yield request(r)
            })
          )
        )
      }

      let ret = yield actor(...assets)

      while (ret === undefined) {
        // when there is no return value (it is undefined) then the value could not be calculated and we should wait for upstream to provide new data
        yield waitForNewAsset
        waitForNewAsset = new Promise((res) => {
          resolveNewAsset = res
        })
        ret = yield actor(...assets)
      }

      return ret
    }

    yield respondTo(`get`, stream, cached(execute))

    yield respondTo(`invalidate`, stream, function* () {
      assets = yield request(streams)
      cached.clear()
      return yield request(stream)
    })
  })

  return task
}
