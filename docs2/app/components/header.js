import { component, html } from "tiden"

import css from "./header/css.js"
import "./touchable.js"
import "./logo.js"

component(
  `x-header`,
  { css },
  function header({ pageId, homeLink, apiLink, tutorialLink }) {
    return html`
      <x-logo></x-logo>

      <navigation>
        <menu>
          <x-touchable .link=${homeLink}>Home</x-touchable>
          <x-touchable .link=${apiLink}>API</x-touchable>
          <x-touchable .link=${tutorialLink}>Tutorial</x-touchable>
        </menu>
      </navigation>
    `
  }
)
