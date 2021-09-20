import { simpleStream, stream } from "tiden"

export default stream(`tutorialId`, function* tutorialId() {
  yield simpleStream(`tutorialId`, `Home`)
})
