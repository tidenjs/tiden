import { render, html, request } from "tiden"

import template from "./template.js"
import "../components/sidebar.js"
import "../components/header.js"
import "../components/main.js"

export default function* tutorial(root) {
  yield template(root, function* (root) {
    const homeData = yield request(`tutorial`)

    let selectedArticle = homeData[0]

    const setSelectedMethod = function(name) {
      selectedArticle = homeData.find(({name: n}) => n === name)
      setTimeout(() => {
        _render()
      })
    }

    const _render = () => {
      render(html`
      <x-header slot="header"></x-header>
      <x-sidebar slot="sidebar"
        .methods="${homeData.map(m => ({
        name: m.name,
        isSelected: m.name === selectedArticle.name,
        selectMethod() {
          setSelectedMethod(m.name)
        }
      }))}"
      >
      </x-sidebar>
      <x-main slot="main" .method="${selectedArticle}"></x-main>
    `, root)
    }

    _render()
  })
}
