import page from "./streams/page.js"
import language from "./streams/language.js"
import tutorial from "./streams/tutorial/tutorial.js"
import methods from "./streams/methods.js"
import methodId from "./streams/methodId.js"
import tutorials from "./streams/tutorials.js"
import tutorialId from "./streams/tutorialId.js"

export default function* streams() {
  yield page
  yield language
  yield tutorial
  yield methods
  yield methodId
  yield tutorials
  yield tutorialId
}
