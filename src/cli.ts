import path from 'path'
import { spawn } from 'child_process'

function getPlatformBin (): string {
  const p = (s: string): string => 'vrelease-' + s

  switch (process.platform) {
    case 'win32':
      return p('windows.exe')

    case 'linux':
      return p('linux')

    case 'darwin':
      return p('macos')

    default:
      throw new Error(`unsupported platform ${process.platform}`)
  }
}

;((): void => {
  try {
    if (process.arch !== 'x64') {
      throw new Error(`unsupported architecture ${process.arch}`)
    }

    const file = getPlatformBin()
    const binPath = path.resolve(__dirname, '..', 'bin', file)

    const input = process.argv.slice(2)
    spawn(binPath, input, { stdio: 'inherit' }).on('exit', process.exit)
  } catch (e) {
    console.log(e)
    process.exit(2)
  }
})()
