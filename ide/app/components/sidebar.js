import { html, component } from "tiden"
import { repeat } from "lit-html/directives/repeat.js"

import "../components/touchable.js"
import "../components/filters.js"
import "../components/icon.js"
import "../components/input.js"
import css from "./sidebar/css.js"

component(`x-sidebar`, { css }, function sidebar({ search, items, filters }) {
  if (!items) {
    return null
  }
  return html`
    <x-input
      .value=${search.text}
      .change=${search.callback}
      .placeholder=${"Write to filter..."}
    ></x-input>
    <x-filters .filters=${filters}></x-filters>
    ${render(items)}
  `
})

function render(items) {
  return html` ${repeat(items, (child) => child.id, renderChild)} `
}

function renderChild(child) {
  return html`
    <div class="child">
      <div class="self">
        <x-touchable .link=${{ onClick: child.toggle }}>
          <div class="expander">
            ${!child.hasChildren ? `` : child.isExpanded ? `▾` : `▸`}
          </div>
        </x-touchable>
        <x-icon .type=${child.type}></x-icon>
        <div class="name">
          ${html([child.text.replace(/\*(.*?)\*/g, `<b>$1</b>`)])}
        </div>
      </div>
      ${child.children && child.children.length > 0 && child.isExpanded
        ? html` <div class="children">${render(child.children)}</div>`
        : ``}
    </div>
  `
}
