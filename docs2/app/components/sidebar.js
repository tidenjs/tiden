import { component, html } from "tiden"
import "./touchable.js"
import css from "./sidebar/css.js"
import { classMap } from "lit-html/directives/class-map.js"

component(`x-sidebar`, { css }, function sidebar({ methods }) {
  // todo wanted to place apiDocumentation or I did something wrong, or streams works in different way

  return html`
    <menu>
      ${methods.map(
        ({ name, selectMethod, isSelected }) => html` <li>
          <x-touchable .link="${{ onClick: selectMethod }}">
            <span class="${classMap({ selected: isSelected })}"> ${name} </span>
          </x-touchable>
        </li>`
      )}
    </menu>
  `
})
