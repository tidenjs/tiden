import cache from "./cache.js"
// caching directive. Calls actor function only on first request, otherwise return saved data
export default function once(actor) {
  return cache()(actor)
}
