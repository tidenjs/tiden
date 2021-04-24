import { fork } from "redux-saga/effects.js"

const { expect } = chai

import respondTo from "./respondTo.js"
import respondToSync from "./respondToSync.js"
import request from "./request.js"
import saga from "../../test/saga.js"

describe(`request/response`, async () => {
  it(
    `should handle shorthand GET`,
    saga(function* () {
      yield respondTo(`get`, `toad`, function* () {
        return `big green toad`
      })

      yield respondTo(`explode`, `toad`, function* () {
        return `exploded green toad`
      })

      expect(yield request(`toad`)).to.equal(`big green toad`)
    })
  )

  it(
    `should handle verbs`,
    saga(function* () {
      yield respondTo(`get`, `toad`, function* () {
        return `big green toad`
      })

      expect(yield request(`get`, `toad`)).to.equal(`big green toad`)
    })
  )

  it(
    `should handle array shorthand`,
    saga(function* () {
      yield respondTo(`get`, `toad`, function* () {
        return `big green toad`
      })

      expect(yield request([`toad`])).to.deep.equal([`big green toad`])
    })
  )

  it(
    `should handle arrays with explicit verbs`,
    saga(function* () {
      yield respondTo(`get`, `toad`, function* () {
        return `big green toad`
      })

      yield respondTo(`explode`, `toad`, function* () {
        return `exploded green toad`
      })

      expect(
        yield request([
          [`get`, `toad`],
          [`explode`, `toad`],
        ])
      ).to.deep.equal([`big green toad`, `exploded green toad`])
    })
  )

  it(
    `should not block on respondToSync`,
    saga(function* () {
      yield fork(function* () {
        yield respondToSync(`get`, `toad`, `frogs for you`)

        const { data, metadata, respond } = yield respondToSync(`get`, `toad`)
        expect(data).to.equal(`please`)
        expect(metadata.text).to.equal(`now`)

        yield respond(`ok, here it is`)
      })

      expect(yield request(`get`, `toad`)).to.equal(`frogs for you`)
      expect(yield request(`get`, `toad`, `please`, { text: `now` })).to.equal(
        `ok, here it is`
      )
    })
  )
})
