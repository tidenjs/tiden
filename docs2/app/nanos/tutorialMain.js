import "../components/main.js"

import { connect, html, render, s } from "tiden"

export default function* tutorialMain(root) {
  render(html` <x-main></x-main>`, root)

  yield connect(root.children[0], {
    markdown,
  })
}

const markdown = s(`tutorialId`, `tutorials`, (tutorialId, tutorials) => {
  console.log(888, tutorialId, tutorials)
  const tutorial = tutorials.find((it) => it.name === tutorialId)

  return tutorial ? tutorial.markdown : null
})
