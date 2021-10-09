import { html, component } from "tiden"

import css from "./sidebar/css.js"

component(`x-sidebar`, { css }, function sidebar({ parts }) {
  return html`
    <pre>
      ${JSON.stringify(parts)}
    </pre
    >
  `
})
