import { cancel, delay, fork } from "redux-saga/effects.js"

import { announce } from "./announce.js"
import connect, { s } from "./connect.js"
import respondTo from "./respondTo.js"

const { expect } = chai
import saga from "../../test/saga.js"

describe(`connect`, async () => {
  it(
    `should gather everything and update when changed`,
    saga(function* () {
      const el = {
        tagName: `DIV`,
      }

      yield respondTo(`get`, `thing1`, function* () {
        return 1
      })

      yield respondTo(`get`, `thing2`, function* () {
        return 2
      })

      yield respondTo(`get`, `thing3`, function* () {
        return 3
      })

      yield fork(function* () {
        yield delay(10)

        expect(el.someProperty).to.equal(6)

        yield announce(`thing2`, 0)

        yield delay(10)

        expect(el.someProperty).to.equal(4)

        el.finish(`ok let's go`)
      })

      const ret = yield connect(el, {
        someProperty: s(
          `thing1`,
          `thing2`,
          `thing3`,
          (t1, t2, t3) => t1 + t2 + t3
        ),
        *finish(arg) {
          return arg
        },
      })

      expect(ret).to.equal(`ok let's go`)
      yield cancel()
    })
  )
})
