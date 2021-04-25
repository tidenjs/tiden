import { delay, fork } from "redux-saga/effects.js"

import mutex from "./mutex.js"

const { expect } = chai

import saga from "../../test/saga.js"

describe(`mutex`, async () => {
  it(
    `should only allow one executor at a time within scope`,
    saga(function* () {
      const lock = mutex()

      const order = []

      yield fork(lock, function* () {
        yield delay(10)
        order.push(1)
      })

      expect(order.length).to.equal(0)

      yield lock(function* () {
        order.push(2)
      })

      expect(order).to.deep.equal([1, 2])
    })
  )
})
