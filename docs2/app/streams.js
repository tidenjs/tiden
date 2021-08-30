import page from "./streams/page.js"
import language from "./streams/language.js"
import apiDocumentation from "./streams/apiDocumentation.js"

export default function* streams() {
  yield page
  yield language
  yield apiDocumentation
}