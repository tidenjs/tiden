import { html, component } from "tiden"

import css from "./apiItem/css.js"

component(`x-api-item`, { css }, function apiItem({ tag, text }) {
  if (tag === `h2`) return html`<h2>${text}</h2>`
  if (tag === `h3`) return html`<h3>${text}</h3>`
  if (tag === `p`) return html`<p>${text}</p>`
  if (tag === `pre`) {
    return html`
      <pre>
        ${text}
      </pre>
    `
  }

  return html``
})
