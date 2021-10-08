import { html, component } from "tiden"

import css from "./template/css.js"

component(`x-template`, { css }, function template({ language }) {
  return html`<div><slot>Tiden IDE</slot></div>`
})
