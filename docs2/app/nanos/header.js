import "../components/header.js"

import { html, linkTo, merge, render } from "tiden"

export default function* header(root) {
  yield render(
    html`
      <x-header
        .pageId=${merge([`page`], function* (page) {
          return page.id
        })}
        .homeLink=${linkTo({ id: `one/two/home` })}
        .apiLink=${linkTo({ id: `one/two/apiLink` })}
        .tutorialLink=${linkTo({ id: `one/two/tutorialLink` })}
      ></x-header>
    `,
    root
  )
}
