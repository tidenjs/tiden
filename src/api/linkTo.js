import { announce } from "./announce.js"
import { generate } from "./routing.js"

export function linkTo(obj, { target = `_blank` } = {}) {
  return {
    *onClick() {
      yield announce(`navigate`, obj)
    },
    href: generate(obj),
    target,
  }
}
