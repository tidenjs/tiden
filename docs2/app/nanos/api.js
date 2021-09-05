import { render, html, request } from "tiden"

import template from "./template.js"
import sidebar from "./sidebar.js"
import header from "./header.js"

export default function* api(root) {
  yield template(root, function* (root) {
    yield render(
      html`
        <span style="display: contents;" slot="header" nano=${header}></span>
        <span style="display: contents;" slot="sidebar" nano=${sidebar}></span>
        <span style="display: contents;" slot="main"></span>
      `,
      root
    )
  })
}
