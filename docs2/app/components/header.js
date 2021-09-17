import { component, html } from "tiden"

import css from "./header/css.js"
import "./touchable.js"
import "./logo.js"

component(
  `x-header`,
  { css },
  function header({ pageId, home, api, tutorial }) {
    if (!pageId) {
      return null
    }

    return html`
      <x-logo></x-logo>

      <navigation>
        <menu>
          <x-touchable .link=${home.link}>Home</x-touchable>
          <x-touchable .link=${api.link}>API</x-touchable>
          <x-touchable .link=${tutorial.link}>Tutorial</x-touchable>
        </menu>
      </navigation>
    `
  }
)
