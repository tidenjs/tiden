# Changes to pre-0.0.1 legacy code

## Removed deprecated methods

- `get` Use `request` instead.
- `getOne` Use `request` instead.
- `set` Use `request` instead.
- `create` Use `request` instead.
- `update` Use `request` instead.
- `takeEveryCreate` Use `respondTo` instead.
- `takeEveryUpdate` Use `respondTo` instead.
- `takeEveryGet` Use `respondTo` instead.
- `takeLeadingGet` This is such a corner case, and won't be covered by this library.
- `unique` Use `whenChanged` instead.
- `distinct` Use `whenChanged` instead.
- `distinct` Use `whenChanged` instead.
- `pipe` Use generator functions directly in `connect` instead.
-  `takeOne` This is such a corner case, and won't be covered by this library.
- `createDispatcher` is no longer exported. Only used internally, as such low-level functionality shouldn't be offered by this library.
- `link` Use `linkTo` instead

## Renames

- `createSimpleConcept` has been renamed to `simpleStream`
- `createCache` has been renamed to `cache`
- `createMutex` has been renamed to `mutex`

## Changes to API

- `mutex` return value is no longer `{*lock}` but just `*lock`.
- assigning arrays as selector to `connect` is now forbidden [1]
- `clearcache` verb has been removed from `merge`. Use `invalidate` instead.
- `merge` now refetches all streams when invalidated (early it only recalculated its value based on already cached upstream values
- Routing no longer prioritize pages that are registrered earlier before later ones. [2]
- Routing interpreters must now return key 'groups' even if a regex. It may also return a key `0` which, if exists, will be used for prioritizations. If unset, then it will be given highest priority.


[1] Assigning objects and literals is still allowed. Arrays will have a different meaning in v1.1 when connect moves towards using merges instead of selectors.

[2] pre-0.0.1 if a page was registered first with a regex of `/.*/` then it would take priority after all the following ones because it was first and matched anything. In 0.0.1 this has changed so that the page that matches the biggest portion of the URL gains priority. This makes it easier to make fallback URLs, and solves race conditions when sub-apps are dynamically loaded.
