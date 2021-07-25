import { createSelector } from "https://cdn.jsdelivr.net/npm/reselect@4.0.0/es/index.js"

export default function s(...args) {
  const assets = []
  const selectors = []

  // if last argument is a function then it is the reducer to be used. If not,
  // its assumed to be a string pointing to the stream that should be returned
  const lastval = args[args.length - 1]
  const func = lastval && lastval.call ? args.pop() : (s) => s

  for (const arg of args) {
    if (typeof arg === `string`) {
      if (arg === `bind`) {
        throw new Error(`bind is deprecated`)
      }
      assets.push(arg)
      selectors.push((s) => s[arg])
    } else {
      if (arg.assets) {
        for (const a of arg.assets) {
          assets.push(a)
        }
      }
      selectors.push(arg)
    }
  }

  const s = createSelector(
    ...selectors,
    (s) => s.bind,
    (...args) => {
      const bind = args.pop()
      const ret = func(...args)
      return bind(ret)
    }
  )
  s.assets = assets

  return s
}
