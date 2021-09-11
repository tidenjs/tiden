import { router } from "tiden"

const id = `home`

function* saga(root) {
  const home = (yield import(`../nanos/home.js`)).default

  yield home(root)
}

export function interpret(url) {
  return url.pathname.match(new RegExp(`^/$`))
}

export function generate(args) {
  return `/`
}

router.register({ id, saga, interpret, generate })
