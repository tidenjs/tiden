import { html, component } from "tiden"

import css from "./input/css.js"

component(`x-input`, { css }, function input({ change, placeholder, value }) {
  return html`
    <input type="search" .value=${
      value || ``
    } @input=${(e) => change(e.target.value)} placeholder=${placeholder || ``}></input>
  `
})
