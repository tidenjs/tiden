import { request, router, subscribe, url, whenChanged } from "tiden"

const id = `api`

function* saga(root) {
  const api = (yield import(`../nanos/api.js`)).default

  yield subscribe(
    `methodId`,
    whenChanged(function* (methodId) {
      yield request(`replace`, `history`, {
        url: generate({ methodId }),
        title: `Tiden API`,
      })
    })
  )

  const { methodId } = yield request(`page`)
  yield request(`set`, `methodId`, methodId)

  yield api(root)
}

export function interpret(url) {
  const match = url.pathname.match(new RegExp(`^/api(/(?<methodId>.*))?$`))
  return match
}

export function generate(args) {
  if (args.methodId) {
    return url`/api/${args.methodId}`()
  } else {
    return url`/api`()
  }
}

router.register({ id, saga, interpret, generate })
