import { html, component } from "tiden"

import css from "./template/css.js"

component(`x-template`, { css }, function template({ language }) {

  return html`
    <div id="header">
      <slot name="header"></slot>
    </div>
    <div id="sidebar">
      <slot name="sidebar"></slot>
    </div>
    <div id="main">
      <slot name="main"></slot>
    </div>
  `
})