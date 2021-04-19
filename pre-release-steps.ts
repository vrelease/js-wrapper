// standard
import fs from 'fs'
import path from 'path'

// 3rd-party
import axios from 'axios'
import { pathToSHA512 } from 'file-to-sha512'

import { version } from './package.json'

const fsPromise = fs.promises
const binFile = (f: string): string => path.join(__dirname, 'bin', f)

function vreleaseArtifactUrl (name: string): string {
  return `https://github.com/vrelease/vrelease/releases/download/v${version}/${name}`
}

async function downloadAndWrite (artifact: string): Promise<string> {
  const destPath = binFile(artifact)

  const res = await axios.get(vreleaseArtifactUrl(artifact), { responseType: 'stream' })
  const stream = res.data.pipe(fs.createWriteStream(destPath))
  await new Promise((fulfill) => stream.on('finish', fulfill))

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
  const artifacts = await downloadArtifacts()
  const shasum = []

  for (let i = 0; i < artifacts.length; i++) {
    const a = artifacts[i]
    const s = await pathToSHA512(a)

    shasum.push(`${s} ${path.basename(a)}`)
  }

  await fsPromise.writeFile(path.join(__dirname, 'SHASUM512'), shasum.join('\n'))
}

(async () => { await main() })()
