import { css } from "tiden"

export default css`
  :host {
    height: 100%;
    display: grid;
    grid-template-areas: "sidebar main";
    grid-template-columns: 320px 1fr;
  }

  #sidebar {
    grid-area: sidebar;
    border-right: 1px solid var(--dust);
    background-color: var(--dust-light);
  }

  #main {
    grid-area: main;
  }
`
