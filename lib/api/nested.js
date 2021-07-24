// little helper to add/remove/replace dom nodes and chain their root argument
//
// nested(root, [
//    template,
//    [
//       onboarding,
//       inviteNew
//    ]
//  ]
//
// This would:
// - start running template with given root argument
// - provide first child of initial root as new root argument to onboarding
// - do same with inviteNew
// - return the value of the first nano that returns a value
// - cancel all the rest
export function* nested(root, structure, isRoot = true) {
  const sagas = []
  let previousRoot
  for (const [i, thing] of structure.entries()) {
    if (Array.isArray(thing)) {
      sagas.push(nested(previousRoot, thing, false))
    } else {
      const { nano, slot } = thing.call ? { nano: thing } : thing
      if (!isRoot) {
        const slotEl = ensure(root, { index: i, tagName: `span` })
        slotEl.style.display = `contents`
        if (slot) {
          slotEl.setAttribute(`slot`, slot)
        } else {
          slotEl.removeAttribute(`slot`)
        }
        sagas.push(prestart(nano(slotEl)))
        previousRoot = slotEl.children[0]
      } else {
        sagas.push(prestart(nano(root)))
        previousRoot = root.children[root.children.length - 1]
      }
    }
  }

  while (root.children.length > structure.length) {
    root.removeChild(root.children[root.children.length - 1])
  }

  const values = yield race(sagas)

  return values.find((it) => it !== undefined)

  function prestart(generator, root) {
    // we want to execute until the first yield statement immediately,
    // not waiting for redux-saga to schedule it. This gives the nano
    // a chance to set up its element.
    let instr = generator.next()

    return (function* () {
      yield instr.value
      return yield* generator
    })()
  }
}
