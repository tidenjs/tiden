import "../components/header.js"

import { html, linkTo, merge, render } from "tiden"

export default function* header(root) {
  yield render(
    html`
      <x-header .home=${home} .api=${api} .tutorial=${tutorial}></x-header>
    `,
    root
  )
}

const home = merge([`page`], function* (page) {
  return { link: linkTo({ id: `home` }), selected: page.id === `home` }
})

const api = merge([`page`], function* (page) {
  return { link: linkTo({ id: `api` }), selected: page.id === `api` }
})

const tutorial = merge([`page`], function* (page) {
  return { link: linkTo({ id: `tutorial` }), selected: page.id === `tutorial` }
})
