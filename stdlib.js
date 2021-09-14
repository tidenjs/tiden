import storage from "./stdlib/streams/storage.js"
import pop from "./stdlib/streams/pop.js"
import history from "./stdlib/streams/history.js"

export function* streams() {
  yield storage
  yield pop
  yield history
}
