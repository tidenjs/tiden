export const path = new URL(import.meta.url + `/../../icon.js`)

export const examples = {

  "not ready": function (el) {
    el.isReady = undefined
  },
  
  default: function (el, {metric}) {
    el.isReady = true
    el.language = `en`
  }
}