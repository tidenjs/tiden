import { html, render } from "tiden"

import sidebar from "./sidebar.js"
import template from "./template.js"

export default function* home(root) {
  yield template(root, function* (root) {
    render(
      html`
        <span style="display: contents" slot="sidebar"></span>
        <span style="display: contents" slot="main"></span>
      `,
      root
    )

    yield sidebar(root.children[0])
  })
}
