export default function cache(keyFunc) {
  let cache = {}

  if (!keyFunc) {
    keyFunc = () => `default`
  }

  const individualCache = (actor) => {
    let promise = {}
    return function* (data, metadata = {}) {
      const key = keyFunc(data, metadata)
      if (cache[key] !== undefined) {
        return cache[key]
      } else if (promise[key]) {
        const val = yield promise[key]
        return val
      } else {
        let res
        promise[key] = new Promise((r) => {
          res = r
        })
        delete metadata.data
        const val = yield actor(data, metadata)
        if (!val || !val[noCacheSymbol]) {
          cache[key] = val
        }
        res(val)
        delete promise[key]
        return val
      }
    }
  }

  individualCache.get = (data, metadata = {}) => {
    const key = keyFunc(data, metadata)
    if (cache[key] !== undefined) {
      return cache[key]
    }
  }

  individualCache.clear = (keyOrFunc) => {
    if (!keyOrFunc) {
      cache = {}
    } else if (typeof keyOrFunc === `function`) {
      Object.keys(cache).forEach((k) => {
        if (keyOrFunc(k)) {
          delete cache[k]
        }
      })
    } else {
      delete cache[keyOrFunc]
    }
  }

  return individualCache
}
export const noCacheSymbol = Symbol(`noCache`)
