import { render, html, request } from "tiden"

import template from "./template.js"
import sidebar from "./sidebar.js"
import header from "./header.js"
import main from "./main.js"

export default function* api(root) {
  yield template(root, function* (root) {
    yield render(
      html`
        <span slot="header" nano=${header}></span>
        <span slot="sidebar" nano=${sidebar}></span>
        <span slot="main" nano=${main}></span>
      `,
      root
    )
  })
}
