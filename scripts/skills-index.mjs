// Builds Kaze's skills market from skills/: each skills/<id>/SKILL.md copied to
// Website/skills/<id>/SKILL.md and listed in Website/skills/index.json, which Kaze reads from
// https://kaze.build/skills/index.json. Runs before every deploy (wrangler.jsonc build); run it
// by hand after changing a skill to check it: `node scripts/skills-index.mjs`.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'skills')
const target = join(root, 'Website', 'skills')
const ID = /^[a-z0-9][a-z0-9-]{0,63}$/
const MAX = 64 * 1024
// A skill's icon, next to its SKILL.md (the first of these it has), inlined in the index as a
// data URL: Kaze shows it on the skill's card instead of guessing at its site's /favicon.ico.
const ICONS = { 'icon.png': 'image/png', 'icon.svg': 'image/svg+xml', 'icon.webp': 'image/webp' }
const MAX_ICON = 32 * 1024

/** The frontmatter fields Kaze reads: strings, and `sites` as a list. */
function frontmatter(text, file) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!m) throw new Error(`${file}: no frontmatter`)
  const meta = {}
  let list = null
  for (const line of m[1].split(/\r?\n/)) {
    const item = /^\s+-\s+(.*)$/.exec(line)
    if (item && list) {
      list.push(unquote(item[1]))
      continue
    }
    const kv = /^([A-Za-z_]+):\s*(.*)$/.exec(line)
    if (!kv) continue
    list = null
    if (kv[2] === '') meta[kv[1]] = list = []
    else meta[kv[1]] = unquote(kv[2])
  }
  if (typeof meta.name !== 'string' || !meta.name.trim()) throw new Error(`${file}: no name`)
  if (typeof meta.description !== 'string' || !meta.description.trim())
    throw new Error(`${file}: no description`)
  return meta
}

const unquote = (s) => s.trim().replace(/^(['"])(.*)\1$/, '$2')

/** When the skill last changed in git (now, outside a checkout or for an uncommitted one). */
function updated(file) {
  try {
    const at = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { cwd: root }).toString().trim()
    if (at) return new Date(at).toISOString()
  } catch {
    // Not a git checkout (a deploy from an archive).
  }
  return new Date().toISOString()
}

const skills = []
for (const id of readdirSync(source).sort()) {
  const file = join(source, id, 'SKILL.md')
  if (!existsSync(file)) continue
  if (!ID.test(id)) throw new Error(`skills/${id}: folder names are lowercase letters, digits and dashes`)
  const content = readFileSync(file, 'utf8')
  if (Buffer.byteLength(content) > MAX) throw new Error(`skills/${id}/SKILL.md: over ${MAX / 1024} KB`)
  const meta = frontmatter(content, `skills/${id}/SKILL.md`)
  const iconFile = Object.keys(ICONS).find((f) => existsSync(join(source, id, f)))
  let icon
  if (iconFile) {
    const bytes = readFileSync(join(source, id, iconFile))
    if (bytes.length > MAX_ICON) throw new Error(`skills/${id}/${iconFile}: over ${MAX_ICON / 1024} KB`)
    icon = `data:${ICONS[iconFile]};base64,${bytes.toString('base64')}`
  }
  skills.push({
    id,
    name: meta.name,
    description: meta.description,
    ...(Array.isArray(meta.sites) && meta.sites.length ? { sites: meta.sites } : {}),
    ...(typeof meta.start_url === 'string' && meta.start_url ? { start_url: meta.start_url } : {}),
    ...(meta.kind === 'task' || meta.kind === 'site' ? { kind: meta.kind } : {}),
    ...(icon ? { icon } : {}),
    updated: updated(`skills/${id}/SKILL.md`),
    sha256: createHash('sha256').update(content).digest('hex'),
    content
  })
}

rmSync(target, { recursive: true, force: true })
for (const s of skills) {
  mkdirSync(join(target, s.id), { recursive: true })
  writeFileSync(join(target, s.id, 'SKILL.md'), s.content)
}
const generated = skills.reduce((at, s) => (s.updated > at ? s.updated : at), '')
writeFileSync(
  join(target, 'index.json'),
  JSON.stringify({ version: 1, generated: generated || new Date().toISOString(), skills }, null, 2) + '\n'
)
console.log(`skills market: ${skills.length} skills → Website/skills/index.json`)
