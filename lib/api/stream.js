import { spawn } from "tiden"

export default function* stream(name, actor) {
  const task = yield spawn(actor)
}
