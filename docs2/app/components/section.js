import { html, component } from "tiden"

import css from "./section/css.js"

component(`x-section`, { css }, function section({ data }) {
  return html`
    Hello! I'm x-section
  `
})