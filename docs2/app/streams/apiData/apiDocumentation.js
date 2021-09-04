import { stream, respondTo } from "tiden"
import data from './apiData.js'

export default stream(`apiDocumentation`, function* language() {
  let selectedMethod = data[0]

  yield respondTo(`get`, `selectedMethod`, function* () {
    return selectedMethod
  })

  yield respondTo(`set`, `selectedMethod`, function* (method) {
    selectedMethod = data.find(({ name }) => name === method)
    return selectedMethod
  })

  yield respondTo(`get`, `apiDocumentation`, function* () {
    return data
  })

  yield respondTo(`get`, `marked`, function* () {
    return []
  })
})
