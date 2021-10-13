import { html, component } from "tiden"

import css from "./filters/css.js"
import "../components/icon.js"

component(`x-filters`, { css }, function filters({ filters }) {
  if (!filters) {
    return null
  }

  return html` ${filters.map(
    (filter) => html`
      <x-touchable .link=${{ onClick: filter.toggle }}>
        <div
          class="filter ${filter.type} ${filter.isSelected ? `isSelected` : ``}"
        >
          <div class="name">${filter.name}</div>
        </div>
      </x-touchable>
    `
  )}`
})
