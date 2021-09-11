import { html, merge, render } from "tiden"
import "../components/main.js"

export default function* main(root) {
  yield render(html` <x-main .markdown=${markdown}></x-main>`, root)
}

const markdown = merge([`methodId`, `methods`], function* (methodId, methods) {
  const method = methods.find((it) => it.name === methodId)

  return method ? method.markdown : null
})
