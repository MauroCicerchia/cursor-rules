// scripts/next-version.mjs
import { createRequire } from 'node:module'
import { readFile, appendFile } from 'node:fs/promises'
import { execSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

const require = createRequire(import.meta.url)
const recommendedBump = require('conventional-recommended-bump')
const semver = require('semver')

async function runRecommendedBump (opts) {
  return await new Promise((resolve, reject) => {
    recommendedBump(opts, (err, result) => {
      if (err) return reject(err)
      resolve(result) // { releaseType, reason }
    })
  })
}

async function main () {
  // Trae historia y tags por si el checkout fue shallow
  try {
    execSync('git fetch --tags origin main', { stdio: 'ignore' })
  } catch {}

  const pkgPath = path.resolve(process.cwd(), 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'))
  const current = pkg.version

  let bump
  try {
    // Usa el preset "conventionalcommits" (requiere conventional-changelog-conventionalcommits instalado)
    bump = await runRecommendedBump({ preset: 'conventionalcommits' })
  } catch (e) {
    // Fallback sin preset para evitar romper PRs en forks/ambientes raros
    bump = await runRecommendedBump({})
  }

  const type = bump.releaseType || 'none'
  const next = bump.releaseType ? semver.inc(current, bump.releaseType) : 'no-release (sin cambios feat/fix/breaking)'
  const reason = bump.reason || ''

  const out = process.env.GITHUB_OUTPUT
  const payload =
    `current=${current}\n` +
    `next=${next}\n` +
    `type=${type}\n` +
    `reason<<__END__\n${reason}\n__END__\n`

  if (out) {
    await appendFile(out, payload)
  } else {
    console.log(JSON.stringify({ current, next, type, reason }))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
