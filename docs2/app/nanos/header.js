import "../components/header.js"

import { connect, html, linkTo, render, s } from "tiden"

export default function* header(root) {
  render(
    html`
      <x-header .home=${home} .api=${api} .tutorial=${tutorial}></x-header>
    `,
    root
  )

  yield connect(root.children[0], {
    home,
    api,
    tutorial,
  })
}

const home = s(`page`, (page) => {
  return { link: linkTo({ id: `home` }), selected: page.id === `home` }
})

const api = s(`page`, (page) => {
  return { link: linkTo({ id: `api` }), selected: page.id === `api` }
})

const tutorial = s(`page`, (page) => {
  return { link: linkTo({ id: `tutorial` }), selected: page.id === `tutorial` }
})
