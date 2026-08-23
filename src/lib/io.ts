import type { Brick } from './types'

export function downloadBuild(bricks: Brick[], filename = 'pocket-bricks-set.json') {
  const blob = new Blob([JSON.stringify(bricks, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function parseBuild(json: string): Brick[] {
  const data = JSON.parse(json)
  if (!Array.isArray(data)) throw new Error('Expected a JSON array of bricks')
  return data as Brick[]
}
