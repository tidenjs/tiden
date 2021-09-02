import {stream, respondTo} from "tiden"
import homeData from './homeData.js'

export default stream(`home`, function* home() {
  yield respondTo(`get`, `homeData`, function*() {
    return homeData
  })
})