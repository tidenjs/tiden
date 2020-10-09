This is nowhere close to a Beta. Not ready for production nor experimental use.

# Tiden

100% native Progressive Web Applications.

This library provides helpers and tutorials for building web applications (single-page apps) using native technology such as Web Components and ES modules. It also strives to find a healthy balance between application-by-state and contextual thinking, _first do this, then that, then use those to do something else_. 

## Cornerstones:

- Do not compile.

  This means that the code you write is what you will see in the final product. When there's an error you'll debug the source code, not some mangled and obfuscated cat hairball.

  Tiden does not use a bundler (such as webpack or browserify). No compiler (such as babel). Just pure JavaScript. No need for sourcemaps. What you see is what you get. Period. Don't worry about performance; that's covered too.

- Encourage portability.

  For work to be truly portable it should be delivered in small packages and have as few dependencies as possible. Using native technologies it can be achieved without the need for complex frameworks.

  Tiden is built with microservice architecture in mind. A Tiden website may be built using one or many micro-frontends, which may be co-located or spread out on separate repositories and/or servers. Tiden even goes one step further with "nano-frontends". 

- Don't compromise. Instead, make complexity easier to understand.

  We've all been there. Complexity will appear in a world where a hundred things can happen at any time without any predefined order. One could, of course, opt to make a simpler product, making compromises with the final result. These compromises are everywhere, you'll find them on any big website. It may be a cart that isn't updated as the item goes out of stock, or a website that makes a complete reload when the user authenticates.

  Tiden uses a form of Message-oriented Programming to increase visibility into the communication between various components in the system. It clearly defines areas of responsibility within each part, and encourages the programmer to make individual demonstrations of each part.

- Be strict and clear.

  Tiden strives to remove choices in how the product shall be built. Nobody gains from tabs-vs-spaces and similar battles. Great examples of products using similar philosophy are Prettier, Effective Go, Python's "the pythonic way", etc.

  Delegating choices means choices will be made differently, spawning many different solutions to the same problem, which discourages portability.

  In this way Tiden is opinionated, like it or not 😉.
