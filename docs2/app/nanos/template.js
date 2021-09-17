import "../components/template.js"

import { render, html } from 'tiden'

export default function* template(root, child) {
  yield render(html`<x-template nano=${child}></x-template>`, root)
}
