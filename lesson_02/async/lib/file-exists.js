import fs from 'node:fs/promises'
import { constants } from 'node:fs'

export async function fileExists(path) {
  try {
    await fs.access(path, constants.F_OK)
    return true
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false
    }
    throw err
  }
}

export async function canReadWrite(path) {
  try {
    await fs.access(path, constants.R_OK | constants.W_OK)
    return true
  } catch (err) {
    if (err.code === 'ENOENT') return false
    throw err
  }
}
