import { component, html } from "tiden"

import css from "./main/css.js"
import './apiItem.js'

component(`x-main`, { css }, function main({ method }) {
  return html`
    <h1>${method.name}</h1>

    ${method.markup.map(c => {
      const [tag, text] = Object.entries(c)[0]
      return html`
      <x-api-item .tag="${tag}" .text="${text}"></x-api-item>
    `}
  )}
  `
})
