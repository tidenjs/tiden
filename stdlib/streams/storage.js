import { compress, decompress } from "../compression.js"
import { stream, respondTo } from "tiden"

let storageIsFunctional

try {
  const testKey = `whatever`
  const testValue = new Date().getTime().toString()
  localStorage[testKey] = testValue
  if (localStorage[testKey] !== testValue) {
    throw new Error(`Could not use localStorage`)
  }
  localStorage.removeItem(testKey)
  storageIsFunctional = true
} catch (e) {
  // we will get here when user has disabled localStorage, or enabled inkognito
  storageIsFunctional = false
}

function encode(value) {
  if (value instanceof Set) {
    value = [`--!class=set`, Array.from(value)]
  }
  value = compress(JSON.stringify(value))
  return value
}

function decode(value) {
  try {
    let ret = decompress(value)
    ret = JSON.parse(ret)
    if (ret && ret.pop && ret[0] === `--!class=set` && ret[1]) {
      ret = new Set(ret[1])
    }
    return ret
  } catch (e) {
    // this is not a compressed JSON object,
    // return it unchanged. However, you should keep in mind that it will be compressed if
    // written back using storage.
    return value
  }
}

function setItem(key, value) {
  if (storageIsFunctional) {
    if (value === undefined) {
      delete localStorage[key]
    } else {
      localStorage[key] = value
    }
  }
}

function getItem(key) {
  if (storageIsFunctional) {
    let ret = localStorage[key]

    return ret
  } else {
    return undefined
  }
}

let cache

function initCache() {
  if (!cache) {
    cache = {}
    if (storageIsFunctional) {
      for (const key of Object.keys(localStorage)) {
        cache[key] = decode(getItem(key))
      }
    }
  }
}

export default stream(`storage`, function* storage() {
  yield respondTo(`get`, `storage`, function* () {
    initCache()
    return cache
  })

  yield respondTo(`set`, `storage`, function* (newData) {
    if (typeof newData !== `object`) {
      throw new Error(`data provided to 'set storage' must be an object`)
    }

    initCache()

    for (const key of Object.keys(newData)) {
      const value = newData[key]

      if (value === undefined) {
        delete localStorage[key]
        delete cache[key]
      } else if (value !== cache[key]) {
        const encoded = encode(value)
        setItem(key, encoded)

        // we have to do this encode/decode to ensure the cache value is same as after page reload
        cache = { ...cache, [key]: decode(encoded) }
      }
    }

    return cache
  })
})
