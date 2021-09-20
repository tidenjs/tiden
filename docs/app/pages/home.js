import { html, render, request, router } from "tiden"

const id = `home`

function* saga(root) {
  const template = (yield import("../nanos/template.js")).default
  const home = (yield import("../components/home.js")).default
  const header = (yield import("../nanos/header.js")).default

  yield request(`replace`, `history`, { title: `Tiden docs`, url: generate() })

  yield template(root, function* (root) {
    yield render(
      html`
        <span slot="header" nano=${header}></span>
        <x-home slot="main"></x-home>
      `,
      root
    )
  })
}

export function interpret(url) {
  return url.pathname.match(new RegExp(`^/$`))
}

export function generate(args) {
  return `/`
}

router.register({ id, saga, interpret, generate })
