import { cancel, delay, fork } from "redux-saga/effects.js"

import listenFor from "./listenFor.js"
import merge from "./merge.js"
import request from "./request.js"
import respondTo from "./respondTo.js"
import announce from "./announce.js"

const { expect } = chai

import saga from "saga"

describe(`merge`, async () => {
  it(
    `should join one or more streams into a new stream, and always be up to date`,
    saga(function* () {
      yield respondTo(`get`, `toads`, function* () {
        return [`a green toad`, `a yellow toad`, `a happy toad`]
      })

      let toadId = 0
      yield respondTo(`get`, `toadId`, function* () {
        return toadId
      })
      yield respondTo(`set`, `toadId`, function* (id) {
        return (toadId = id)
      })

      yield merge([`toads`, `toadId`], `toad`, function* (toads, id) {
        return toads[id]
      })

      expect(yield request(`toad`)).to.equal(`a green toad`)

      yield delay(1)

      let automaticallyAnnounced = false
      const listener = yield listenFor(`toad`, function* (toad) {
        expect(toad).to.equal(`a happy toad`)
        automaticallyAnnounced = true
      })

      // merges automatically update when upstream changes,
      // so our listener above should fire after changing the id here:
      yield request(`set`, `toadId`, 2)
      yield delay(1)
      expect(automaticallyAnnounced).to.equal(true)
      yield cancel(listener)

      // we can also request it explicitly
      expect(yield request(`toad`)).to.equal(`a happy toad`)
    })
  )

  it(
    `should cache automatically, and provide invalidate verb`,
    saga(function* () {
      let ducksInAPond = 0
      yield respondTo(`get`, `ducksInAPond`, function* () {
        ducksInAPond += 1
        return ducksInAPond
      })
      yield merge([`ducksInAPond`], `it`, function* (ducks) {
        return ducks
      })

      expect(yield request(`it`)).to.equal(1)
      expect(yield request(`it`)).to.equal(1)
      expect(yield request(`it`)).to.equal(1)

      yield request(`invalidate`, `it`)
      expect(yield request(`it`)).to.equal(2)
    })
  )

  it(
    `should block until return value is non-undefined`,
    saga(function* () {
      let ducks

      yield respondTo(`get`, `ducks`, function* () {
        return ducks
      })

      yield merge([`ducks`], `it`, function* (ducks) {
        if (ducks === 3) {
          return true
        }
      })

      yield fork(function* () {
        for (ducks = 0; ducks < 10; ducks++) {
          yield announce(`ducks`, ducks)
          yield delay(5)
        }
      })

      expect(yield request(`it`)).to.equal(3)
    })
  )
})
