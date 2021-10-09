import { css } from "tiden"

export default css`
  :host {
    height: 100%;
    display: grid;
    grid-template-areas: "sidebar main";
    grid-template-columns: 350px 1fr;
  }

  #sidebar {
    grid-area: sidebar;
  }

  #main {
    grid-area: main;
  }
`
