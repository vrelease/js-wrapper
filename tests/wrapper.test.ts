/* globals describe it expect jest */

import * as cp from 'node:child_process'
import path from 'node:path'

import { VRelease } from '../src/wrapper'

jest.mock('node:child_process', () => ({
  spawn: jest.fn(),
}))

describe('VRelease:', () => {
  const vb = VRelease.builder

  describe('Command builder:', () => {
    it('Should build a command with checksum flag', () =>
      expect(vb().addChecksum().build()).toEqual(['-add-checksum']))

    it('Should build a command with debug flag', () =>
      expect(vb().enableDebug().build()).toEqual(['-debug']))

    it('Should build a command with no color flag', () =>
      expect(vb().noColor().build()).toEqual(['-no-color']))

    it('Should build a command with description flag', () =>
      expect(vb().addDescription().build()).toEqual(['-add-description']))

    it('Should build a command with pre-release flag', () =>
      expect(vb().preRelease().build()).toEqual(['-pre-release']))

    it('Should build a command with attacheables', () =>
      expect(vb().attach('my-file').build()).toEqual(['-attach', 'my-file']))

    it('Should build a command with many attacheables', () =>
      expect(vb().attach('a', 'b').build()).toEqual(['-attach', 'a', '-attach', 'b']))

    it('Should build a command with limit of changelog items', () =>
      expect(vb().setLimit(100).build()).toEqual(['-limit', '100']))

    it('Should not build a command when the limit is below 0', () =>
      expect(() => vb().setLimit(-1).build()).toThrow('limit must be equal or greater than zero'))

    it('Should build a complex command', () => {
      const cmd =
        '-add-description -add-checksum -pre-release -debug -no-color -limit 250 -attach first -attach second -attach third'

      const built = vb()
        .addDescription()
        .addChecksum()
        .enableDebug()
        .noColor()
        .setLimit(250)
        .attach('first')
        .attach('second', 'third')
        .preRelease()
        .build()

      expect(built).toEqual(cmd.split(' '))
    })
  })

  describe('Command runner:', () => {
    const binPath = (s: string): string => path.resolve(__dirname, '..', 'bin', `vrelease-${s}`)

    const mockStringField = (field: string, retval: string): jest.SpyInstance => {
      const proto = VRelease.prototype as unknown as Record<string, () => string>
      return jest.spyOn(proto, field).mockImplementation((): string => retval)
    }

    const spawnSpy = cp.spawn as jest.MockedFunction<typeof cp.spawn>

    const setupSpawn = (
      exitCode: number | null = 0,
      signal: NodeJS.Signals | null = null,
      once = false,
    ): void => {
      // @ts-expect-error - mocked process
      const impl = (cmd: string, args: readonly string[], opts: cp.SpawnOptions) => {
        const proc = {
          once: (
            event: string,
            cb: (code?: number | null, signal?: NodeJS.Signals | null) => void,
          ) => {
            if (event === 'exit') {
              cb(exitCode, signal)
            }
            return proc
          },
          on: (
            event: string,
            cb: (code?: number | null, signal?: NodeJS.Signals | null) => void,
          ) => {
            if (event === 'exit') {
              cb(exitCode, signal)
            }
            return proc
          },
        }
        return proc as unknown as cp.ChildProcess
      }

      if (once) {
        spawnSpy.mockImplementationOnce(impl)
        return
      }

      spawnSpy.mockImplementation(impl)
    }

    beforeEach(() => {
      spawnSpy.mockReset()
      setupSpawn()
    })

    it('Should run with proper binary', async () => {
      const map = [
        ['win32', 'x64', 'windows.exe'],
        ['linux', 'x64', 'linux'],
        ['linux', 'arm64', 'linux-arm64'],
        ['darwin', 'x64', 'macos-x86_64'],
        ['darwin', 'arm64', 'macos-arm64'],
      ]

      for (const m of map) {
        const [platform, arch, n] = m
        mockStringField('getPlatform', platform)
        mockStringField('getArch', arch)

        await vb().run()
        expect(spawnSpy).toBeCalledWith(binPath(n), [], { stdio: 'inherit' })
      }
    })

    it('Should receive the command arguments', async () => {
      mockStringField('getPlatform', 'linux')
      mockStringField('getArch', 'x64')
      const args = ['-add-description', '-limit', '50', '-attach', 'artifact']

      await vb().addDescription().setLimit(50).attach('artifact').run()
      expect(spawnSpy).toBeCalledWith(binPath('linux'), args, { stdio: 'inherit' })
    })

    it('Should suppress the output when the flag is set', async () => {
      mockStringField('getPlatform', 'linux')
      mockStringField('getArch', 'x64')

      await new VRelease([], true).run()
      expect(spawnSpy).toBeCalledWith(binPath('linux'), [], { stdio: 'ignore' })
    })

    it('Should throw when an unsupported platform is detected', async () => {
      const p = 'android'
      mockStringField('getPlatform', p)
      mockStringField('getArch', 'x64')

      const c = async (): Promise<void> => await vb().run()
      await expect(c).rejects.toThrow(`unsupported platform ${p}`)
    })

    it('Should throw when an unsupported arch is detected', async () => {
      const a = 'ppc'
      mockStringField('getArch', a)

      const c = async (): Promise<void> => await vb().run()
      await expect(c).rejects.toThrow(`unsupported architecture ${a}`)
    })

    it('Should throw when exit code is non-zero', async () => {
      mockStringField('getPlatform', 'linux')
      mockStringField('getArch', 'x64')
      setupSpawn(1, null, true)

      const c = async (): Promise<void> => await vb().run()
      await expect(c).rejects.toThrow('process exited with code 1')
    })
  })
})
