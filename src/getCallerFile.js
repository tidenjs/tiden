export default function getCallerFile() {
  const old = Error.prepareStackTrace

  try {
    Error.prepareStackTrace = function (err, stack) {
      return stack
    }

    const filenames = new Error().stack.map((it) => it.getFileName())

    const caller = filenames.find(
      (name) => name !== filenames[0] && name && !name.includes(`redux-saga`)
    )

    if (caller) {
      return caller
    }
  } catch (err) {
  } finally {
    Error.prepareStackTrace = old
  }
  return undefined
}
