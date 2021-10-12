import { html, component } from "tiden"
import { repeat } from "lit-html/directives/repeat.js"

import "../components/touchable.js"
import css from "./sidebar/css.js"

component(`x-sidebar`, { css }, function sidebar({ items }) {
  if (!items) {
    return null
  }
  return html` ${render(items.children)} `
})

function render(items) {
  return html` ${repeat(items, (child) => child.id, renderChild)} `
}

function renderChild(child) {
  return html`
    <div class="child ${child.theme ? `theme-${child.theme}` : ``}">
      <div class="self">
        <x-touchable .link=${{ onClick: child.toggle }}>
          <div class="expander">
            ${!child.toggle ? `` : child.isExpanded ? `▾` : `▸`}
          </div>
        </x-touchable>
        <div class="name">${child.title}</div>
      </div>
      ${child.children && child.children.length > 0 && child.isExpanded
        ? html` <div class="children">${render(child.children)}</div>`
        : ``}
    </div>
  `
}
