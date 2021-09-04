import {stream, respondTo} from "tiden"

export default stream(`language`, function* language() {
  let language = `en`
  yield respondTo(`set`, `language`, function* (newLanguage) {
    language = newLanguage
    return language
  })

  yield respondTo(`get`, `language`, function* () {
    return language
  })
})