# Web Components tutorial

This tutorial has both a video and text. The video has more details and explanations, but it is 60 minutes long. The text has links to external sources and may be more suitable for reference.

We'll go through how to create a new Tiden project. The focus is on getting started and getting acquainted with templates and components, but we'll also scratch the surface of Pages and Nanos.

[![Introduction to Tiden Web Components](/assets/tutorials/1-web-components/thumb.png)](https://www.youtube.com/watch?v=zyfUkpVLlK8)

## Getting started

Make sure you have npm or yarn installed, then install Tiden using:

```
npm install -g tiden
```

Create a folder for your project. For this tutorial, we're converting Tiden documentation from raw HTML and CSS. So I'll name it "tiden-docs."

You can also supply a description. If you do, then it is used to add [Open Graph](https://ogp.me/) tags. It will also add the description to your [manifest.json](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json) file

```
mkdir tiden-docs
cd tiden-docs
tiden init tiden-docs -d "Tiden API reference & documentation"
```

Then start your server using the command:

```
tiden start
```

## Setting up the template (basic layout) of your app

We recommend that you use templates to structure your pages. This way, you don't need to duplicate your layout logic. `tiden init` automatically creates a template for you.

Let's modify it to add a header, sidebar, and main content area!

The files you need to modify are at:

```
app/components/template.js
app/components/template/css.js
app/components/template/demo.js
```

I will not include `demo` in this tutorial. (we are still in the alpha phase, and demos don't work yet). So, for now, remember that we strongly recommend creating demonstrations for every part of your app. Consider it similar to software testing using methodologies like BDD.

The main file is `template.js`. Here we define the logic and HTML for our template component. The result is a native Custom Element. If you want to dive deep into understanding these, I suggest reading Google's [Custom Elements v1: Reusable Web Components](https://developers.google.com/web/fundamentals/web-components/customelements) and Mozilla's [Using custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).

In Tiden Custom Elements, always create a shadow root. Inside shadow roots, the HTML and CSS encapsulate from the global DOM. Think of it as a separate DOM. Thus, outside calls such as `document.querySelector` won't find your elements. Also, CSS won't leak across the border of your component, although CSS that inherits by default will still do so. Encapsulation is incredible because it means we can make CSS like `h1 { font-size: 30px; }` without worrying about all the `h1` being affected throughout the app. In addition, it is leading to simpler code with less complicated selectors.

Another massive benefit of Custom Elements is that we can make combinations of Components using slots. In essence, any `<slot></slot>` tags in the shadow dom will be replaced with the children when used. Also, slots can be named and used to differentiate when there is more than one. So let's set our template HTML for these placeholders.

```javascript
import { html, component } from "tiden"

import css from "./template/css.js"

component(`x-template`, { css }, function template() {
  return html`
    <div id="header"><slot name="header"></slot></div>
    <div id="sidebar"><slot name="sidebar"></slot></div>
    <div id="main"><slot name="main"></slot></div>
  `
})
```

Let's also add some CSS in our `template/css.js` file:

```css
:host {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-areas: "header header" "sidebar main";
  grid-template-rows: 50px 1fr;
  grid-template-columns: minmax(150px, min-content) 1fr;
}

#header {
  grid-area: header;
  border-bottom: 1px solid;
  display: flex;
  align-items: stretch;
}

#sidebar {
  grid-area: sidebar;
  border-right: 1px solid;
}

#main {
  grid-area: main;
}
```

Save the files, and see that your app now has a basic layout with header, sidebar, and main. It should look like this:

![Template modified](/assets/tutorials/1-web-components/template-modified.png)

## Adding more components

To create a component in Tiden, use:

```
tiden create component <name> [namespace]
```

Now, we don't need a namespace for this project, so ignore it for now.

We want a header, a logo, a sidebar, and a main component:

```
tiden create component header
tiden create component sidebar
tiden create component main
tiden create component logo
```

The commands above create files using the same structure as our already existing template.

## Using our new components

In Tiden, a Nano controls every part of the app. A Nano is an independent kind of "microservice." It's a little engine that retrieves upstream data, performs any necessary processing, and supplies data as properties to the Web Components. In Tiden, both Components and Nanos are independent and may be created, hosted, executed in separate environments. For this project, we'll use them all in the same project, though.

`tiden init` automatically create a Nano called `home`. You may delete this if you prefer to structure your project differently, but we'll keep using it for this article.

Find the file `app/nanos/tutorial.js`. Add the necessary imports to our newly created components and supply them to the template. Remember, as we're using named slots, the template component will know where to place them deeply nested within its shadow DOM.

```javascript
import { render, html } from "tiden"

import template from "./template.js"
import "../components/header.js"
import "../components/sidebar.js"
import "../components/main.js"

export default function* home(root) {
  yield template(root, function* (root) {
    render(
      html`
        <x-header slot="header"></x-header>
        <x-sidebar slot="sidebar"></x-sidebar>
        <x-main slot="main"></x-main>
      `,
      root
    )
  })
}
```

As for the code of these new components, please consult the video. There we also go through how to manage callbacks and some simplified state.

Tiden components can be reused anywhere, within any framework, even at places where Tiden isn't running at all. The result is native to the web.
