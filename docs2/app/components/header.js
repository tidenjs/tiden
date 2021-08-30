import { component, html } from "tiden"

import css from "./header/css.js"
import "./logo.js"

component(`x-header`, { css }, function header({ language }) {
  return html`
    <x-logo></x-logo>

    <navigation>
      <menu>
        <li>home</li>
        <li>api</li>
        <li>tutorial</li>
      </menu>
    </navigation>
  `
})