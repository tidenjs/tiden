export default function () {
  return `// clean up elements in DOM that are only needed for setting things up
  document.querySelectorAll("[data-initial]").forEach((el) => {
    el.parentElement.removeChild(el)
  })

  document.body.innerHTML = \`Hello there :-)\``
}
