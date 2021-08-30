import { router } from "tiden"

const id = `one/two/tutorial`

function* saga(root) {
  const tutorial = (yield import(`../nanos/tutorial.js`)).default

  yield tutorial(root)
}

export function interpret(url) {
  return url.pathname.match(
    new RegExp(`^/tutorial$`)
  )
}

export function generate(args) {
  return `/tutorial`
}

router.register({id, saga, interpret, generate})