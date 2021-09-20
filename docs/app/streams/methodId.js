import { respondTo, simpleStream, stream } from "tiden"

export default stream(`methodId`, function* methodId() {
  yield simpleStream(`methodId`, `publish`)
})
