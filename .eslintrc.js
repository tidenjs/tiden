module.exports = {
  env: { es2020: true, browser: true },
  parserOptions: {
    sourceType: `module`,
    ecmaFeatures: {
      jsx: true,
      impliedStrict: true,
    },
  },
  rules: {
    quotes: [`error`, `backtick`],
    eqeqeq: `error`,
    "no-var": [`error`],
    "no-console": [`warn`, { allow: [`warn`, `error`, `debug`] }],
  },
}
