import { fork, html, render } from "tiden"

import header from "./header.js"
import main from "./main.js"
import sidebar from "./sidebar.js"
import template from "./template.js"

export default function* api(root) {
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
