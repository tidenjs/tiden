import { fork, html, render, request, router } from "tiden"

const id = `tutorial`

function* saga(root) {
  const [template, header, sidebar, main] = (yield Promise.all([
    import(`../nanos/template.js`),
    import(`../nanos/header.js`),
    import(`../nanos/tutorialSidebar.js`),
    import(`../nanos/tutorialMain.js`),
  ])).map((it) => it.default)

  yield request(`replace`, `history`, {
    title: `Tiden tutorials`,
    url: generate(),
  })

  yield template(root, function* (root) {
    render(
      html`
        <span slot="header"></span>
        <span slot="sidebar"></span>
        <span slot="main"></span>
      `,
      root
    )

    yield fork(header, root.children[0])
    yield fork(sidebar, root.children[1])
    yield fork(main, root.children[2])
  })
}

export function interpret(url) {
  return url.pathname.match(new RegExp(`^/tutorial$`))
}

export function generate(args) {
  return `/tutorial`
}

router.register({ id, saga, interpret, generate })
