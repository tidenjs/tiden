import {stream, respondTo} from "tiden"
import lesson0 from './tutorial/lesson0.js'
import lesson1 from './tutorial/lesson1.js'
import lesson2 from './tutorial/lesson2.js'

export default stream(`tutorial`, function* homeData() {
  yield respondTo(`get`, `tutorial`, function* () {
    return [
      lesson0,
      lesson1,
      lesson2
    ]
  })
})