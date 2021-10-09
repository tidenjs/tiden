import o from "outdent"

export default () => o`
  import tiden from "tiden"
  import app from "./app.js"
  import { start as startHmr } from "tiden/lib/api/hmr.js"

  // clean up elements in DOM that are only needed for setting things up
  document.querySelectorAll("[data-initial]").forEach((el) => {
    el.parentElement.removeChild(el)
  })

  startHmr(\`/project/changes\`)
  tiden(app)
`
