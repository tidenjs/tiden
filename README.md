Tiden is currently in the Alpha phase. Features may be added or removed at any time. Bugs are still likely to occur, so please post them as Issues. Getting feedback dramatically helps us achieve the v1.0 milestone!

# Tiden

_Build flexible web apps using modern native web technology_

## Get started

```
npm install -g tiden
tiden init <project name> [-d "project description"]
tiden start
```

For more commands, use the command:

```
tiden help
```

## How to upgrade

New versions of Tiden are released often. To get the latest CLI:

```
npm update -g tiden
```

And then, to upgrade your own project:

```
cd myProject
tiden upgrade
```

## Tutorials

Tutorials are currently in progress. Subscribe to receive notifications when new videos are added.

[Web Components](/tutorials/1-web-components/article.md)

[Tiden communication; streams, pages, and nanos](/tutorials/communication-streams-pages-nanos/article.md)

## Community

- Got some amazing ideas? Or just want to throw some inspiration at us? Maybe you want to donate lots of money. [Join us at Discord](https://discord.gg/Yj6UsECFCP)

- @mikabytes creates instructive videos about Tiden. Follow him on [Youtube](https://www.youtube.com/channel/UC6nZU9OrRBxcZmE-2__p8ZA)

- He also tweets about Tiden and the Web at [Twitter](https://twitter.com/mika_bytes)

## Core values

- Native first

  If there is a native solution to a problem, then focus energy on creating tools and tutorials for using it.

  Native is the common ground. The further away from native we go, the more significant the gap between programmers. Big frameworks also tend to have difficulty adapting to future technology. Tiden strives to be small and unobtrusive.

- Modular architecture

  Each part should be able to function as designed on its own. Independent features make it easier to split work across teams and reduce the work-test-fix cycle of development. It also helps to focus on the current problem at hand.

  While a single team can use Tiden, it can also scale across several separate teams, repositories, and servers.

  Think "micro-services," but for the web.

  Building modules also enable using Tiden within a project and an external framework such as React or Angular. Of course, you can also do the opposite, using external frameworks within Tiden.

- Message-oriented communication

  The integration must be highly flexible to build a project that scales across teams, servers, and repositories. That's why Tiden uses messages as the basis for application logic and state. Messages are the most flexible form of communication in existence. Within messages, you can construct all other flow structures.

  Using messages is also the standard way of the web. Javascript is event-based, so our application should also be.

## Browser support

Tiden has official support for all major browsers released in the past year. While this might seem short to some, please remember that all these browsers automatically update by default. So the only reason they'd be outdated is when the device was offline or turned off for a whole year, or the user turned off automatic updates.

Tiden is also likely to work in much older browsers than these. However, we don't consider it a bug if it does not.

Major browsers: Edge, Firefox, Chrome, Safari, Opera

# Milestone schedule

Milestones usually don't have dates, but each have a vision and focus for that major release. The naming schedule is:

1. Stone: we're currently working on this, it's done when Tiden is production ready
2. Bronze: gradual improvements on Stone
3. Iron: exciting new features
4. Glass
5. Metal
6. Steam
7. Gas
8. Electric
9. Plastic
10. Nuclear
11. ... we'll have to brainstorm this when we get there
