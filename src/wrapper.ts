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

  private getPlatformBin (): string {
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

  public async run (): Promise<void> {
    if (process.arch !== 'x64') {
      throw new Error(`unsupported architecture ${process.arch}`)
    }

    const file = 'vrelease-' + this.getPlatformBin()
    const binPath = path.resolve(__dirname, '..', 'bin', file)

    const args = this.args
    const stdio = this.suppressOutput ? 'ignore' : 'inherit'

    return await new Promise(function (resolve, reject) {
      const process = spawn(binPath, args, { stdio })

      process.on('exit', () => {
        resolve()
      })

      process.on('error', (err) => {
        reject(err)
      })
    })
  }

  public static builder (): VReleaseCmdBuilder {
    return new VReleaseCmdBuilder()
  }
}
