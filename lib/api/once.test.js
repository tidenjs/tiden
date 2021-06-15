import once from "./once.js"
import request from "./request.js"
import respondTo from "./respondTo.js"

const { expect } = chai

import saga from "saga"

describe(`once`, async () => {
  it(
    `should only run once, always return cached data`,
    saga(function* () {
      let counter = 0
      yield respondTo(
        `get`,
        `toad`,
        once(function* () {
          counter += 1
          return counter
        })
      )

      expect(yield request(`toad`)).to.equal(1)
      expect(yield request(`toad`)).to.equal(1)
      expect(yield request(`toad`)).to.equal(1)
    })
  )
})
