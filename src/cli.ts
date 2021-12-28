import path from 'path'
import { spawn } from 'child_process'

function err (e: unknown): string {
  if (e instanceof Error) {
    return e.message
  }

  return JSON.stringify(e)
}

function getPlatformBin (): string {
  switch (process.platform) {
    case 'win32':
      return 'windows.exe'

    case 'linux':
      return 'linux'

    case 'darwin':
      return 'macos'

    default:
      throw new Error(`unsupported platform ${process.platform}`)
  }
}

;((): void => {
  try {
    if (process.arch !== 'x64') {
      throw new Error(`unsupported architecture ${process.arch}`)
    }

    const file = 'vrelease-' + getPlatformBin()
    const binPath = path.resolve(__dirname, '..', 'bin', file)

    const input = process.argv.slice(2)
    spawn(binPath, input, { stdio: 'inherit' }).on('exit', process.exit)
  } catch (e) {
    console.log(err(e))
    process.exit(2)
  }
})()
