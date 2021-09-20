import "../components/sidebar.js"

import { connect, html, render, request, s } from "tiden"

export default function* tutorialSidebar(root) {
  render(html`<x-sidebar></x-sidebar>`, root)

  yield connect(root.children[0], {
    methods,
  })
}

const methods = s(`methodId`, `tutorials`, (methodId, tutorials) => {
  return tutorials.map((m) => {
    return {
      name: m.name,
      isSelected: m.name === methodId,
      link: {
        *onClick() {
          yield request(`set`, `tutorialId`, m.name)
        },
      },
    }
  })
})
