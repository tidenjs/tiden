import { connect, s, render, html, fork } from "tiden"

import "../components/template.js"

export default function* template(root, child) {
  render(html`<x-template></x-template>`, root)
  
  yield fork(child, root.children[0])
}