export default function mutex() {
  let promise

  function* lock(actor) {
    while (promise) {
      yield promise
    }
    let res
    try {
      promise = new Promise((r) => (res = r))
      return yield actor()
    } finally {
      res()
      promise = null
    }
  }

  return lock
}
