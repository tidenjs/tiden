export const clsNms = (names) => {
  return Object.entries(names).filter(([key, value]) => !!value).map(([key]) => key).join(` `)
}