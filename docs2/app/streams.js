import page from "./streams/page.js"
import language from "./streams/language.js"
import home from "./streams/home/home.js"
import tutorial from "./streams/tutorial/tutorial.js"
import methods from "./streams/methods.js"
import methodId from "./streams/methodId.js"

export default function* streams() {
  yield page
  yield language
  yield home
  yield tutorial
  yield methods
  yield methodId
}
