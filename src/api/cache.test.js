import cache from "./cache.js"
import request from "./request.js"
import respondTo from "./respondTo.js"

const { expect } = chai

import saga from "../../test/saga.js"

describe(`cache`, async () => {
  it(
    `should only run once for each key`,
    saga(function* () {
      // use main argument as caching key
      const cached = cache((data) => data)

      let counter = 0

      yield respondTo(
        `stamp`,
        `time`,
        cached(function* () {
          counter += 1
          return counter
        })
      )

      const first = yield request(`stamp`, `time`, 1)
      const second = yield request(`stamp`, `time`, 2)
      const third = yield request(`stamp`, `time`, 1)
      const fourth = yield request(`stamp`, `time`, 2)

      expect(first).to.equal(1)
      expect(second).to.equal(2)
      expect(third).to.equal(1)
      expect(fourth).to.equal(2)

      cached.clear(1)

      const fifth = yield request(`stamp`, `time`, 1)
      const sixth = yield request(`stamp`, `time`, 2)

      expect(fifth).to.equal(3)
      expect(sixth).to.equal(2)

      cached.clear((it) => it === `1`)

      const seventh = yield request(`stamp`, `time`, 1)
      const eighth = yield request(`stamp`, `time`, 2)

      expect(seventh).to.equal(4)
      expect(sixth).to.equal(2)
    })
  )
})
