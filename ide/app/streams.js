import page from "./streams/page.js"
import language from "./streams/language.js"

export default function* streams() {
  yield page
  yield language
}