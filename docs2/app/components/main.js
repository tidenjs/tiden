import { component, render} from "tiden"

import css from "./main/css.js"
import './apiItem.js'

component(`x-main`, { css }, function main({ method }) {

  //useEffect and this

  return marked(method.markup)
})
