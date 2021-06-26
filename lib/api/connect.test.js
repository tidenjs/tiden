import { delay, fork } from "redux-saga/effects.js"

import publish from "./publish.js"
import connect, { s } from "./connect.js"
import subscribe from "./subscribe.js"
import respondTo from "./respondTo.js"

const { expect } = chai
import saga from "saga"

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

        yield publish(`thing2`, 0)

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
    })
  )

  it(
    `should allow objects and literals in place of selectors, but not arrays`,
    saga(function* () {
      const errors = []
      const el = { tagName: `x-awesome` }
      yield fork(function* () {
        yield subscribe(`error`, function* (w) {
          errors.push(w)
        })
      })

      yield fork(connect, el, {
        object: {
          value: `hello`,
        },
        number: 1,
        string: `string`,
        array: [`this should error`],
      })

      yield delay(2)

      expect(errors).to.deep.equal([
        `An array was sent to 'connect', this is no longer allowed. Please use a selector instead. Caller was http://localhost:1100/src/api/connect.js`,
      ])
      expect(el.object).to.deep.equal({ value: `hello` })
      expect(el.number).to.equal(1)
      expect(el.string).to.equal(`string`)
      expect(el).to.not.contain.key(`array`)
    })
  )
})
