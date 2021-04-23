import path from 'path'
import { spawn } from 'child_process'

function getPlatformBin (): string {
  switch (process.platform) {
    case 'win32':
      return 'vrelease-windows.exe'

    case 'linux':
      return 'vrelease-linux'

    case 'darwin':
      return 'vrelease-macos'

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
    process.exit(2)
  }
})()
