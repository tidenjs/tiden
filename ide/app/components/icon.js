import { html, component } from "tiden"

import css from "./icon/css.js"

component(`x-icon`, { css }, function icon({ type }) {
  return html` <div class=${type}></div> `
})
