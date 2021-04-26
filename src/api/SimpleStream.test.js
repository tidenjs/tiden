import request from "./request.js"
import SimpleStream from "./SimpleStream.js"

const { expect } = chai
import saga from "saga"

describe(`SimpleStream`, async () => {
  it(
    `should default to 'null'`,
    saga(function* () {
      yield SimpleStream(`frogColor`)

      expect(yield request(`frogColor`)).to.equal(null)
    })
  )

  it(
    `should default to provided initial value`,
    saga(function* () {
      yield SimpleStream(`frogColor`, `green`)

      expect(yield request(`frogColor`)).to.equal(`green`)
    })
  )

  it(
    `should handle simple get/set`,
    saga(function* () {
      yield SimpleStream(`frogColor`)

      expect(yield request(`set`, `frogColor`, `yellow`)).to.equal(`yellow`)
      expect(yield request(`frogColor`)).to.equal(`yellow`)
    })
  )
})
