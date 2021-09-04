import { router } from "tiden"

const id = `one/two/api`

function* saga(root) {
  const api = (yield import(`../nanos/api.js`)).default

  yield api(root)
}

export function interpret(url) {
  return url.pathname.match(
    new RegExp(`^/api$`)
  )
}

export function generate(args) {
  return `/api`
}

router.register({id, saga, interpret, generate})