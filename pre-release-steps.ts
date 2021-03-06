// standard
import fs from 'fs'
import path from 'path'
import util from 'util'
import { exec } from 'child_process'

// 3rd-party
import axios from 'axios'
import { pathToSHA512 } from 'file-to-sha512'

import { version, vrelease } from './package.json'

const asyncFs = fs.promises
const asyncExec = util.promisify(exec)

const log = (t: string): void => console.log(' ~ ' + t)
const binFile = (f: string): string => path.join(__dirname, 'bin', f)
const artifactUrl = (f: string): string =>
  `https://github.com/vrelease/vrelease/releases/download/v${vrelease.version}/${f}`

const shasumFilename = 'SHASUM512'

async function downloadAndWrite (fn: string): Promise<string> {
  const destPath = binFile(fn)

  const res = await axios.get(artifactUrl(fn), { responseType: 'stream' })
  const stream = res.data.pipe(fs.createWriteStream(destPath))
  await new Promise((resolve) => stream.on('finish', resolve))

  return destPath
}

async function downloadArtifacts (): Promise<string[]> {
  const releases = ['linux', 'macos', 'windows.exe']

  const promisesToExec = []
  for (let i = 0; i < releases.length; i++) {
    promisesToExec.push(downloadAndWrite(`vrelease-${releases[i]}`))
  }

  return await Promise.all(promisesToExec)
}

async function main (): Promise<void> {
  log('downloading artifacts')
  const artifacts = await downloadArtifacts()
  const shasum = []

  log('calculating hashes')
  for (let i = 0; i < artifacts.length; i++) {
    const a = artifacts[i]
    await asyncExec('chmod +x ' + a)

    const s = await pathToSHA512(a)
    shasum.push(`${s} ${path.basename(a)}`)
  }

  await asyncFs.writeFile(path.join(__dirname, shasumFilename), shasum.join('\n'))

  try {
    log('closing tag')
    await asyncExec('git add ' + shasumFilename)
    await asyncExec('git commit -m "chore: update binary hashes"')
    await asyncExec('git tag v' + version)
  } catch (e) {
    log('got: '.concat(JSON.stringify(e)))
    log('skipping tag...')
  }

  log('done')
}

main().catch((err: Error): void => console.error(err))
