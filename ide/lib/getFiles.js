export default async function getFiles({ include, exclude }) {
  const res = await fetch(
    `/project/files?${(include =
      encodeURIComponent(include))}&exclude=${encodeURIComponent(exclude)}`,
    {
      headers: {
        accept: `application/json`,
      },
    }
  )

  if (!res.ok) {
    throw new Error(await res.text())
  }

  const json = await res.json()
  return json
}
