import tiden from "tiden"
import app from "./app.js"

// clean up elements in DOM that are only needed for setting things up
document.querySelectorAll(`[data-initial]`).forEach((el) => {
  el.parentElement.removeChild(el)
})

tiden(app)
