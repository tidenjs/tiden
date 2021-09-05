import "../components/sidebar.js"

import { html, merge, render, request } from "tiden"

export default function* sidebar(root) {
  yield render(html` <x-sidebar .methods=${methods}></x-sidebar> `, root)
}

const methods = merge([`methodId`, `methods`], (methodId, methods) => {
  return methods.map((m) => {
    return {
      name: m.name,
      isSelected: m.name === methodId,
      link: {
        *onClick() {
          yield request(`set`, `methodId`, m.name)
        },
      },
    }
  })
})
