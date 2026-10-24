/**
 * Build src/data/surflineSpots.json from Surfline's public taxonomy API.
 *
 * The Add Spot form searches this file locally instead of a general-purpose
 * geocoder, so "manhattan" finds Manhattan Beach Pier rather than Manhattan, NY.
 *
 * Run with:  npm run build-spots
 *
 * Surfline's edge (Cloudflare) rejects two things that rule out a live lookup
 * from the deployed app and a plain Node fetch here:
 *   - any request carrying an Origin header other than surfline.com/localhost
 *     (so the browser can't call it from GitHub Pages), and
 *   - Node's TLS fingerprint (fetch() gets a 403 where curl over HTTP/1.1 is
 *     fine). Hence the shell-out to curl below.
 */
import { execFile } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'

const EARTH_ID = '58f7ed51dadb30820bb38782'
const TAXONOMY_URL = `https://services.surfline.com/taxonomy?type=taxonomy&id=${EARTH_ID}&maxDepth=10`
const OUT = new URL('../src/data/surflineSpots.json', import.meta.url)
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

const run = promisify(execFile)

console.log('Fetching Surfline taxonomy…')
const { stdout } = await run(
  'curl',
  ['--http1.1', '-sS', '--fail', '--max-time', '300', '-A', UA, '-H', 'Accept: */*', TAXONOMY_URL],
  { maxBuffer: 256 * 1024 * 1024 },
)
const earth = JSON.parse(stdout)
const nodes = earth.contains ?? []
const byId = new Map(nodes.map(n => [n._id, n]))

// Continents sit at depth 0 directly under Earth; we drop them from the
// breadcrumb so paths read "United States › California › Los Angeles County".
const continents = new Set(nodes.filter(n => n.depth === 0).map(n => n.name))

/** Deepest geoname a spot lies in — directly, or via its subregion. */
function geonameParent(spot) {
  const parents = (spot.liesIn ?? []).map(id => byId.get(id)).filter(Boolean)
  const direct = parents.find(p => p.type === 'geoname')
  if (direct) return direct
  for (const p of parents) {
    const viaSub = (p.liesIn ?? []).map(id => byId.get(id)).find(g => g?.type === 'geoname')
    if (viaSub) return viaSub
  }
  return null
}

// Region tree: unique path prefixes, each stored as [name, parentIndex] (-1 = root).
const regions = []
const regionIndex = new Map()
function regionFor(path) {
  let parent = -1
  for (let i = 0; i < path.length; i++) {
    const key = JSON.stringify(path.slice(0, i + 1))
    let idx = regionIndex.get(key)
    if (idx == null) {
      idx = regions.length
      regions.push([path[i], parent])
      regionIndex.set(key, idx)
    }
    parent = idx
  }
  return parent
}

const spots = []
let skipped = 0
for (const n of nodes) {
  if (n.type !== 'spot') continue
  const [lon, lat] = n.location?.coordinates ?? []
  if (typeof lat !== 'number' || typeof lon !== 'number') { skipped++; continue }
  const geo = geonameParent(n)
  const path = (geo?.enumeratedPath ?? '')
    .split(',')
    .filter(Boolean)
    .filter((name, i) => !(i === 0 && name === 'Earth') && !continents.has(name))
  spots.push([
    n.spot,
    n.name.trim(),
    Math.round(lat * 1e4) / 1e4,
    Math.round(lon * 1e4) / 1e4,
    regionFor(path),
  ])
}
spots.sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]))

// One entry per line keeps git diffs readable when the list is refreshed.
const json = [
  '{',
  '"source": "https://services.surfline.com/taxonomy (Surfline spot taxonomy)",',
  `"generatedAt": ${JSON.stringify(new Date().toISOString().slice(0, 10))},`,
  '"regions": [',
  regions.map(r => JSON.stringify(r)).join(',\n'),
  '],',
  '"spots": [',
  spots.map(s => JSON.stringify(s)).join(',\n'),
  ']',
  '}',
  '',
].join('\n')

await mkdir(new URL('./', OUT), { recursive: true })
await writeFile(OUT, json)
console.log(`Wrote ${spots.length} spots, ${regions.length} regions (${(json.length / 1024).toFixed(0)} KB) → ${OUT.pathname}`)
if (skipped) console.log(`Skipped ${skipped} spots without coordinates`)
