#!/usr/bin/env node
/**
 * Verifies all locale JSON files have identical key sets vs en.json.
 * Exit 0 on parity, 1 on mismatch.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const i18nDir = path.join(__dirname, '../src/i18n')

function collectKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? collectKeys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

const enPath = path.join(i18nDir, 'en.json')
const baseKeys = collectKeys(JSON.parse(fs.readFileSync(enPath, 'utf8'))).sort()

let failed = false

for (const file of fs.readdirSync(i18nDir).filter((f) => f.endsWith('.json'))) {
  const keys = collectKeys(
    JSON.parse(fs.readFileSync(path.join(i18nDir, file), 'utf8')),
  ).sort()
  const missing = baseKeys.filter((k) => !keys.includes(k))
  const extra = keys.filter((k) => !baseKeys.includes(k))
  if (missing.length || extra.length) {
    failed = true
    console.error(`\n${file}:`)
    if (missing.length) console.error(`  missing (${missing.length}):`, missing.slice(0, 10).join(', '), missing.length > 10 ? '...' : '')
    if (extra.length) console.error(`  extra (${extra.length}):`, extra.slice(0, 10).join(', '), extra.length > 10 ? '...' : '')
  }
}

if (failed) {
  console.error(`\ni18n check failed (en.json has ${baseKeys.length} keys)`)
  process.exit(1)
}

console.log(`i18n OK — ${baseKeys.length} keys in all ${fs.readdirSync(i18nDir).filter((f) => f.endsWith('.json')).length} locales`)
