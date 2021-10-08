export default async function getFiles({ match, exclude }) {
  const res = await fetch(
    url`/files`({
      include,
      exclude,
    })
  )

  if (!res.ok) {
    throw new Error(await res.text())
  }

  const json = await res.json()
  return json
}
