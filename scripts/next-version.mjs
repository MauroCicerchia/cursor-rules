// scripts/next-version.mjs
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { execSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

const require = createRequire(import.meta.url)
const recommendedBump = require('conventional-recommended-bump')
const semver = require('semver')

async function main () {
  // 1) Ensure complete history and tags (in case the action didn't bring them)
  try {
    execSync('git fetch --tags origin main', { stdio: 'ignore' })
  } catch {}

  // 2) Current version from package.json
  const pkgPath = path.resolve(process.cwd(), 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'))
  const current = pkg.version

  // 3) Calculate bump according to Conventional Commits from the last semver tag
  const bump = await new Promise((resolve, reject) => {
    recommendedBump(
      {
        preset: 'conventionalcommits', // same as semantic-release default
        tagPrefix: ''
      },
      (err, result) => {
        if (err) return reject(err)
        resolve(result) // { releaseType: 'major'|'minor'|'patch'|undefined, reason }
      }
    )
  })

  const type = bump.releaseType // can be undefined if there are no relevant changes
  const next = type ? semver.inc(current, type) : null

  // 4) Export outputs for the action
  // If next is null, set a friendly string
  const nextOut = next ?? 'no-release (no feat/fix/breaking changes)'
  const reason = bump.reason ?? ''

  // Write to GITHUB_OUTPUT so other steps can read it
  const out = process.env.GITHUB_OUTPUT
  if (out) {
    await Bun.write(out, `current=${current}\nnext=${nextOut}\ntype=${type ?? 'none'}\nreason<<__END__\n${reason}\n__END__\n`)
  } else {
    console.log(JSON.stringify({ current, next: nextOut, type: type ?? 'none', reason }))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
