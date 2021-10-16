import { component, html, useEffect } from "tiden"

import css from "./input/css.js"

component(`x-input`, { css }, function input({ change, placeholder, value }) {
  useEffect(() => {
    this.focus = () => {
      this.shadowRoot.querySelector(`input`).focus()
    }
  }, [])

  return html`
    <input type="search" .value=${
      value || ``
    } @input=${(e) => change(e.target.value)} placeholder=${placeholder || ``}></input>
  `
})
