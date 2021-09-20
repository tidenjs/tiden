import { css } from "tiden"

export default css`
  :host {
    display: grid;
    grid-template-areas: "header header" "sidebar main";
    grid-template-rows: 60px 1fr;
    grid-template-columns: min-content 1fr;
    height: 100%;
  }

  #header {
    grid-area: header;
    border-radius: 5px;
  }

  #sidebar {
    grid-area: sidebar;
    padding: 10px;
  }

  #main {
    grid-area: main;
    padding: 10px;
    overflow: hidden;
    overflow-y: auto;
  }
`
