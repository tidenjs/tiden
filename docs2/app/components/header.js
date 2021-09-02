import { component, html } from "tiden"

import css from "./header/css.js"
import './touchable.js'
import "./logo.js"

component(`x-header`, { css }, function header({ language }) {
  return html`
    <x-logo></x-logo>

    <navigation>
      <menu>
        <x-touchable .link="${{ href: `./` }}">home</x-touchable>
        <x-touchable .link="${{ href: `./api` }}">api</x-touchable>
        <x-touchable .link="${{ href: `./tutorial` }}">tutorial</x-touchable>
      </menu>
    </navigation>
  `
})