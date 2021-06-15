import request from "./request.js"
import simpleStream from "./simpleStream.js"

const { expect } = chai
import saga from "saga"

describe(`simpleStream`, async () => {
  it(
    `should default to 'null'`,
    saga(function* () {
      yield simpleStream(`frogColor`)

      expect(yield request(`frogColor`)).to.equal(null)
    })
  )

  it(
    `should default to provided initial value`,
    saga(function* () {
      yield simpleStream(`frogColor`, `green`)

      expect(yield request(`frogColor`)).to.equal(`green`)
    })
  )

  it(
    `should handle simple get/set`,
    saga(function* () {
      yield simpleStream(`frogColor`)

      expect(yield request(`set`, `frogColor`, `yellow`)).to.equal(`yellow`)
      expect(yield request(`frogColor`)).to.equal(`yellow`)
    })
  )
})
