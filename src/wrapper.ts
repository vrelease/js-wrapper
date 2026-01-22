import path from 'path'
import { spawn } from 'child_process'

class VReleaseCmdBuilder {
  private addDescriptionFlag: boolean = false
  private addChecksumFlag: boolean = false
  private preReleaseFlag: boolean = false
  private debugFlag: boolean = false
  private noColorFlag: boolean = false

  private limitParam: number = -1
  private readonly attacheables: string[] = []

  public addDescription (): this {
    this.addDescriptionFlag = true
    return this
  }

  public addChecksum (): this {
    this.addChecksumFlag = true
    return this
  }

  public preRelease (): this {
    this.preReleaseFlag = true
    return this
  }

  public enableDebug (): this {
    this.debugFlag = true
    return this
  }

  public noColor (): this {
    this.noColorFlag = true
    return this
  }

  public setLimit (l: number): this {
    if (l < 0) {
      throw new Error('limit must be equal or greater than zero')
    }

    this.limitParam = l
    return this
  }

  public attach (...p: string[]): this {
    this.attacheables.push(...p)
    return this
  }

  public build (): string[] {
    const cmd: string[] = []

    if (this.addDescriptionFlag) {
      cmd.push('-add-description')
    }

    if (this.addChecksumFlag) {
      cmd.push('-add-checksum')
    }

    if (this.preReleaseFlag) {
      cmd.push('-pre-release')
    }

    if (this.debugFlag) {
      cmd.push('-debug')
    }

    if (this.noColorFlag) {
      cmd.push('-no-color')
    }

    if (this.limitParam > -1) {
      cmd.push('-limit', this.limitParam.toString())
    }

    if (this.attacheables.length > 0) {
      cmd.push(...this.attacheables.map((a) => ['-attach', a]).flat())
    }

    return cmd
  }

  public async run (suppressOutput?: boolean): Promise<void> {
    return await new VRelease(this.build(), suppressOutput).run()
  }
}

export class VRelease {
  private readonly args: string[]
  private readonly suppressOutput: boolean

  public constructor (args: string[], suppressOutput: boolean = false) {
    this.args = args
    this.suppressOutput = suppressOutput
  }

  /* istanbul ignore next */
  private getPlatform (): string {
    return process.platform
  }

  /* istanbul ignore next */
  private getArch (): string {
    return process.arch
  }

  private getPlatformBin (): string {
    const p = this.getPlatform()
    const arch = this.getArch()

    if (arch !== 'x64' && arch !== 'arm64') {
      throw new Error(`unsupported architecture ${arch}`)
    }

    switch (p) {
      case 'win32':
        if (arch !== 'x64') {
          throw new Error(`unsupported architecture ${arch}`)
        }
        return 'windows.exe'

      case 'linux':
        return arch === 'arm64' ? 'linux-arm64' : 'linux'

      case 'darwin':
        return arch === 'arm64' ? 'macos-arm64' : 'macos-x86_64'

      default:
        throw new Error(`unsupported platform ${p}`)
    }
  }

  public async run (): Promise<void> {
    const file = 'vrelease-' + this.getPlatformBin()
    const binPath = path.resolve(__dirname, '..', 'bin', file)

    const args = this.args
    const stdio = this.suppressOutput ? 'ignore' : 'inherit'

    return await new Promise(function (resolve, reject) {
      let settled = false
      const child = spawn(binPath, args, { stdio })

      child.once('error', (err) => {
        if (settled) {
          return
        }
        settled = true
        reject(err)
      })

      child.once('exit', (code, signal) => {
        if (settled) {
          return
        }
        settled = true
        if (code === 0) {
          resolve()
          return
        }
        if (signal) {
          reject(new Error(`process exited with signal ${signal}`))
          return
        }
        reject(new Error(`process exited with code ${code}`))
      })
    })
  }

  public static builder (): VReleaseCmdBuilder {
    return new VReleaseCmdBuilder()
  }
}
