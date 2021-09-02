import { render, html, request } from "tiden"

import template from "./template.js"
import "../components/sidebar.js"
import "../components/header.js"
import "../components/main.js"

export default function* api(root) {
  yield template(root, function* (root) {
    const apiDocumentation = yield request(`apiDocumentation`)
    // const selectedMethod = yield request(`selectedMethod`)

    let selectedMethod = apiDocumentation[0]

    // const setSelectedMethod = function*(name) {
    //   console.log(name)
    // yield publish(`selectedMethod`, name) // todo how??
    const setSelectedMethod = function(name) {
      //
      selectedMethod = apiDocumentation.find(({name: n}) => n === name)
      setTimeout(() => {
        _render()
      })
    }

    const _render = () => {
      render(html`
      <x-header slot="header"></x-header>
      <x-sidebar slot="sidebar"
        .methods="${apiDocumentation.map(m => ({
        name: m.name,
        isSelected: m.name === selectedMethod.name,
        selectMethod() {
          setSelectedMethod(m.name)
        }
      }))}"
      >
      </x-sidebar>
      <x-main slot="main" .method="${selectedMethod}"></x-main>
    `, root)
    }

    _render()
  })
}
