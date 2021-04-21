import { applyMiddleware, createStore } from "redux"
import createSagaMiddleware from "redux-saga"

export default function saga(generator) {
  return async function () {
    const sagaMiddleware = createSagaMiddleware()
    const store = createStore((s) => s || {}, applyMiddleware(sagaMiddleware))
    await sagaMiddleware.run(generator).toPromise()
  }
}
