import { connect, s } from "tiden"
import "../components/sidebar.js"

export default function* sidebar(root) {
  const el = document.createElement(`x-sidebar`)
  root.appendChild(el)

  yield connect(el, {
    parts,
  })
}

const parts = s(`parts`, (parts) => {
  return parts
})
