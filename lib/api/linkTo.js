import publish from "./publish.js"
import { generate } from "./routing.js"

export default function linkTo(obj, { target = `_blank` } = {}) {
  return {
    *onClick() {
      yield publish(`navigate`, obj)
    },
    href: generate(obj),
    target,
  }
}
