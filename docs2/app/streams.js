import page from "./streams/page.js"
import language from "./streams/language.js"
import apiDocumentation from "./streams/apiData/apiDocumentation.js"
import home from "./streams/home/home.js"
import tutorial from "./streams/tutorial/tutorial.js"

export default function* streams() {
  yield page
  yield language
  yield apiDocumentation
  yield home
  yield tutorial
}