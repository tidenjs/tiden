import { stream, respondTo } from "tiden"
import o from "https://cdn.jsdelivr.net/npm/outdent@0.8.0/lib-module/index.js"

export default stream(`tutorials`, function* tutorials() {
  yield respondTo(`get`, `tutorials`, function* () {
    return [
      {
        name: `Home`,
        markdown: o`
          # Tutorials

          Please select a tutorial from the left-side menu.

          These are still being produced, so if you're interested check in often. You can also follow [@mikabytes on Twitter](https://twitter.com/mika_bytes) or join us at [ Discord ](https://discord.gg/Yj6UsECFCP)
        `,
      },
      {
        name: `Web Components`,
        markdown: yield download(`1-web-components/article.md`),
      },
    ]
  })
})

async function download(path) {
  const res = await fetch(`/assets/tutorials/${path}`)

  if (res.ok) {
    return await res.text()
  } else {
    throw new Error(await res.text())
  }
}
