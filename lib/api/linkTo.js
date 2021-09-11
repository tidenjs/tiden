import publish from "./publish.js"
import { generate } from "./routing.js"

export default function linkTo(obj, { target = `_blank` } = {}) {
  return {
    *onClick() {
      yield request(`set`, `page`, obj)
    },
    href: generate(obj),
    target,
  }
}
