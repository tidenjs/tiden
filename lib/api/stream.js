import * as tiden from "tiden"

export default function* stream(name, actor) {
  const task = yield fork(actor, tiden)
}
