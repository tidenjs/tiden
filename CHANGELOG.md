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

## Renames

- `createSimpleConcept` has been renamed to `simpleStream`
- `createCache` has been renamed to `cache`
- `createMutex` has been renamed to `mutex`

## Changes to API

- `mutex` return value is no longer `{*lock}` but just `*lock`.
- assigning arrays as selector to `connect` is now forbidden [1]


[1] Assigning objects and literals is still allowed. Arrays will have a different meaning in v1.1 when connect moves towards using merges instead of selectors.
