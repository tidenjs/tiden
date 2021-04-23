import { applyMiddleware, createStore } from "redux"
import createSagaMiddleware from "redux-saga"

const sagaMiddleware = createSagaMiddleware({
  onError(e, { sagaStack }) {
    console.error(e)
    console.error(sagaStack)
  },
})
const store = createStore((s) => s || {}, applyMiddleware(sagaMiddleware))

export default function saga(generator) {
  return async function () {
    const task = sagaMiddleware.run(generator)
    await task.toPromise()
  }
}
