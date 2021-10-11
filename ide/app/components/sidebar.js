import { html, component } from "tiden"
import { repeat } from "lit-html/directives/repeat.js"

import "../components/touchable.js"
import css from "./sidebar/css.js"
import typeToIcon from "../typeToIcon.js"

component(`x-sidebar`, { css }, function sidebar({ data }) {
  if (!data) {
    return null
  }
  return html` ${render(data)} `
})

function render(obj) {
  return html` ${repeat(obj.parts, (part) => part.id, renderPart)} `
}

function renderPart(part) {
  return html`
    <div class="part">
      <x-touchable .link=${{ onClick: part.toggle }}>
        <div class="expander">${part.isExpanded ? `▾` : `▸`}</div>
      </x-touchable>
      <div class="icon">${typeToIcon(part.type)}</div>
      <div class="name">${part.name}</div>
    </div>
  `
}
