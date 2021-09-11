import "../components/header.js"

import { html, linkTo, merge, render } from "tiden"

export default function* header(root) {
  yield render(
    html`
      <x-header
        .pageId=${merge([`page`], function* (page) {
          return page.id
        })}
        .home=${{ link: linkTo({ id: `home` }) }}
        .api=${{ link: linkTo({ id: `api` }) }}
        .tutorial=${{ link: linkTo({ id: `tutorial` }) }}
      ></x-header>
    `,
    root
  )
}
