import { call } from "redux-saga/effects.js"
import { request, subscribe, race, fork } from "tiden"
import { render as upstreamRender, directive } from "lit-html"

import bridge from "../bridge.js"
import isGeneratorFunction from "../isGeneratorFunction.js"

import {
  IS_MERGE,
  STREAM_NAME,
  SET_STREAM_NAME,
  IS_ANONYMOUS,
} from "./merge.js"
let uniqueId = 0

export default function render(html, root) {
  const { run, bind } = bridge()
  const sagas = []

  for (const [i, value] of [...html.values].entries()) {
    if (value[IS_MERGE] || isGeneratorFunction(value)) {
      html.values[i] = directive(() => (part) => {
        if (part.committer === undefined) {
          throw new Error(
            `Generator functions can't be used in the body of an element`
          )
        }

        const el = part.committer.element
        const propertyName = part.committer.name

        if (part.committer.parts.length > 1) {
          throw new Error(
            `GeneratorFunction (saga) cannot be shared with other values in a property`
          )
        }

        if (value[IS_MERGE]) {
          const meaningfulName = `${el.tagName}.${propertyName}`
          if (value[IS_ANONYMOUS]) {
            value[SET_STREAM_NAME](`${meaningfulName}-${uniqueId++}`)
          }
          sagas.push(function* () {
            // this is a merge(), so let's start it
            yield value
            const initialValue = yield request(value[STREAM_NAME])
            el[propertyName] = bind(initialValue, meaningfulName)
            yield subscribe(value[STREAM_NAME], function* (data) {
              el[propertyName] = bind(data, meaningfulName)
            })
          })
        } else {
          sagas.push(function* () {
            // this is a normal generator function, so let's call it
            el[propertyName] = yield value(el, propertyName)
          })
        }
      })()
    }
  }
  upstreamRender(html, root)

  // return a saga in case caller would like to connect this html
  return (function* () {
    yield fork(run)

    const vals = yield race(sagas.map((saga) => call(saga)))

    // we return the first task that finishes
    return vals.find((it) => it !== undefined)
  })()
}
