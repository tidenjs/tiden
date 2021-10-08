import {stream, respondTo} from "tiden"

export default stream(`page`, function* page() {
  let page
  yield respondTo(`set`, `page`, function* (newPage) {
    page = newPage
    return page
  })
  
  yield respondTo(`get`, `page`, function* () {
    return page
  })
})