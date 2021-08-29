export default function getCallerFile() {
  const old = Error.prepareStackTrace

  try {
    Error.prepareStackTrace = function (err, stack) {
      return stack
    }

    const filenames = new Error().stack.map((it) => it.getFileName())

    const thisFunction = filenames[0]
    const askerFunction = filenames[1]

    let caller = filenames.find(
      (name) =>
        name !== thisFunction &&
        name !== askerFunction &&
        name &&
        !name.includes(`redux-saga`)
    )

    if (caller) {
      // first, if there's an origin in the name then remove it
      try {
        const url = new URL(caller)
        caller = caller.slice(url.origin.length + 1)
      } catch (e) {}

      return caller
    }
  } catch (err) {
  } finally {
    Error.prepareStackTrace = old
  }
  return undefined
}
