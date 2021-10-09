import { url } from "tiden"

export default async function getFiles({ include, exclude }) {
  const res = await fetch(
    url`/project/files`({
      include,
      exclude,
    }),
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
