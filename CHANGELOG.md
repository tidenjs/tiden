Changes to pre-Tiden legacy code:

- `createSimpleConcept` has been renamed to `simpleStream`
- Earlier deprected method `get` has been removed. Use `request` instead.
- Earlier deprected method `getOne` has been removed. Use `request` instead.
- Earlier deprected method `set` has been removed. Use `request` instead.
- Earlier deprected method `create` has been removed. Use `request` instead.
- Earlier deprected method `update` has been removed. Use `request` instead.
- Earlier deprected method `takeEveryCreate` has been removed. Use `respondTo` instead.
- Earlier deprected method `takeEveryUpdate` has been removed. Use `respondTo` instead.
- Earlier deprected method `takeEveryGet` has been removed. Use `respondTo` instead.
- Earlier deprected method `takeLeadingGet` has been removed. This is such a corner case, and won't be covered by this library.
- Earlier deprected method `unique` has been removed. Use `whenChanged` instead.
- Earlier deprected method `distinct` has been removed. Use `whenChanged` instead.
- Earlier deprected method `distinct` has been removed. Use `whenChanged` instead.
- Earlier deprected method `pipe` has been removed. Use generator functions directly in `connect` instead.
- Earlier deprected method `takeOne` has been removed. This is such a corner case, and won't be covered by this library.
- `createDispatcher` is no longer exported. Only used internally, as such low-level functionality shouldn't be offered by this library.
- Deprecated the use of assigning arrays directly in place to connect selectors. While assigning objects is still allowed, arrays will have a different meaning in v1.1
