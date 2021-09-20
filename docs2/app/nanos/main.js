import "../components/main.js"

import { connect, html, render, s } from "tiden"

export default function* main(root) {
  render(html` <x-main></x-main>`, root)

  yield connect(root.children[0], {
    markdown,
  })
}

const markdown = s(`methodId`, `methods`, (methodId, methods) => {
  const method = methods.find((it) => it.name === methodId)

  return method ? method.markdown : null
})
