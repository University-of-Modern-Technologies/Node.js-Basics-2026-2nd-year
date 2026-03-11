import fs from 'node:fs/promises'
import { DATA_DIR } from './lib/paths.js'

async function listJsonFilesWithMeta() {
  const entries = await fs.readdir(DATA_DIR)
  const jsonFiles = entries.filter((name) => name.endsWith('.json'))

  const result = []

  for (const name of jsonFiles) {
    const fullPath = new URL(`../data/${name}`, import.meta.url)
    const stats = await fs.stat(fullPath)
    console.log(stats)
    result.push({
      name,
      size: stats.size,
      mtime: stats.mtime,
    })
  }

  return result
}

try {
  const files = await listJsonFilesWithMeta()
  console.log('JSON файли в data/:')
  for (const file of files) {
    console.log(
      `- ${file.name}: ${file.size} байт, mtime=${file.mtime.toISOString()}`,
    )
  }
} catch (err) {
  console.error('Помилка:', err)
}
