import page from "./streams/page.js"
import language from "./streams/language.js"
import parts from "./streams/parts.js"

export default function* streams() {
  yield page
  yield language
  yield parts
}