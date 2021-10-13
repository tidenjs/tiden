import { css } from "tiden"

export default css`
  :host {
    display: flex;
    flex-direction: column;
    padding: 12px;
  }

  x-filters {
    margin-bottom: 6px;
  }

  .child > .self {
    display: flex;
    padding: 3px;
    align-items: center;
  }

  .children {
    display: flex;
    flex-direction: column;
    padding-left: 20px;
  }

  .expander {
    box-sizing: border-box;
    width: 20px;
    height: 20px;
    text-align: center;
    line-height: 17px;
  }

  x-icon {
    padding-right: 3px;
  }

  .expander {
    color: var(--arrow-color);
    cursor: initial;
  }

  .name {
    color: var(--text-color);
    font-family: Roboto;
    font-weight: 400;
  }

  .component {
    background-color: var(--part-component);
  }

  .nano {
    background-color: var(--part-nano);
  }

  .stream {
    background-color: var(--part-stream);
  }

  .page {
    background-color: var(--part-page);
  }
`
