console.warn(`'ensure' is deprecated.`)

// make sure a DOM node at a certain position is of a certain type
export default function ensure(root, { index = 0, tagName }) {
  let el

  if (index > 0) {
    while (!root.children[index - 1]) {
      // add a dummy element to ensure that we create an element at the right position
      const t = document.createElement(`span`)
      root.appendChild(t)
    }
  }

  if (!root.children[index]) {
    el = document.createElement(tagName)
    root.appendChild(el)
  } else if (
    root.children[index].tagName.toLowerCase() !== tagName.toLowerCase()
  ) {
    root.removeChild(root.children[index])
    el = document.createElement(tagName)
    root.insertBefore(el, null)
  } else {
    el = root.children[index]
  }

  return el
}
