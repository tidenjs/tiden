import { cancel } from "redux-saga/effects"

const { expect } = chai

import { respondTo } from "../src/api/respondTo.js"
import request from "../src/api/request.js"
import saga from "./saga.js"

describe(`api`, async () => {
  it(
    `should handle request/response pair`,
    saga(function* (done) {
      yield respondTo(`get`, `toad`, function* () {
        return `big green toad`
      })

      yield respondTo(`explode`, `toad`, function* () {
        return `exploded green toad`
      })

      expect(yield request(`toad`)).to.equal(`big green toad`)
      expect(yield request(`get`, `toad`)).to.equal(`big green toad`)
      expect(yield request([`toad`])).to.deep.equal([`big green toad`])
      expect(
        yield request([
          [`get`, `toad`],
          [`explode`, `toad`],
        ])
      ).to.deep.equal([`big green toad`, `exploded green toad`])

      yield cancel()
    })
  )
})
