import { component, html } from "tiden"

import css from "./main/css.js"
import marked from "marked"

component(`x-main`, { css }, function main({ method }) {
  return html([marked(method.markup)])
})
