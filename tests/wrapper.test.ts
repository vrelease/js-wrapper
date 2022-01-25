/* globals describe it expect jest */

import path from 'path'
import * as cp from 'child_process'

import { VRelease } from '../src/wrapper'

jest.mock('child_process')

describe('VRelease:', () => {
  describe('Command builder:', () => {
    it('Should build a command with attacheables', () =>
      expect(VRelease.builder().attach('my-file').build()).toEqual(['-attach', 'my-file']))

    it('Should build a command with many attacheables', () => {
      const c = ['-attach', 'one', '-attach', 'two', '-attach', 'three']
      expect(VRelease.builder().attach('one', 'two', 'three').build()).toEqual(c)
    })

    it('Should build a command with description flag', () =>
      expect(VRelease.builder().addDescription().build()).toEqual(['-add-description']))

    it('Should build a command with checksum flag', () =>
      expect(VRelease.builder().addChecksum().build()).toEqual(['-add-checksum']))

    it('Should build a command with pre-release flag', () =>
      expect(VRelease.builder().preRelease().build()).toEqual(['-pre-release']))

    it('Should build a command with debug flag', () =>
      expect(VRelease.builder().enableDebug().build()).toEqual(['-debug']))

    it('Should build a command with no color flag', () =>
      expect(VRelease.builder().noColor().build()).toEqual(['-no-color']))

    it('Should build a command with limit of changelog items', () =>
      expect(VRelease.builder().setLimit(100).build()).toEqual(['-limit', '100']))

    it('Should not build a command when the limit is below 0', () =>
      expect(() => VRelease.builder().setLimit(-1).build()).toThrow(
        'limit must be equal or greater than zero'
      ))

    it('Should build a complex command', () => {
      const c = ['-add-description', '-add-checksum', '-pre-release', '-debug', '-no-color']
      const d = ['-limit', '250', '-attach', 'first', '-attach', 'second', '-attach', 'third']

      expect(
        VRelease.builder()
          .addDescription()
          .addChecksum()
          .enableDebug()
          .noColor()
          .setLimit(250)
          .attach('first')
          .attach('second', 'third')
          .preRelease()
          .build()
      ).toEqual([...c, ...d])
    })
  })

  describe('Command runner:', () => {
    const spawnSpy = jest
      .spyOn(cp, 'spawn')
      // @ts-expect-error
      .mockImplementation((cmd: string, args: readonly string[], opts: cp.SpawnOptions) => {
        return {
          on: (_: string, cb: (v?: any) => void) => cb()
        }
      })

    const mockStringField = (field: string, retval: string): jest.SpyInstance =>
      jest.spyOn(VRelease.prototype as any, field).mockImplementation((): string => retval)

    const binPath = (s: string): string => path.resolve(__dirname, '..', 'bin', 'vrelease-' + s)

    it('Should run with proper binary', async () => {
      const map = [
        ['win32', 'windows.exe'],
        ['linux', 'linux'],
        ['darwin', 'macos']
      ]

      for (const m of map) {
        const [platform, n] = m
        mockStringField('getPlatform', platform)

        await VRelease.builder().run()
        expect(spawnSpy).toBeCalledWith(binPath(n), [], { stdio: 'inherit' })
      }
    })

    it('Should receive the command arguments', async () => {
      mockStringField('getPlatform', 'linux')
      const args = ['-add-description', '-limit', '50', '-attach', 'artifact']

      await VRelease.builder().addDescription().setLimit(50).attach('artifact').run()
      expect(spawnSpy).toBeCalledWith(binPath('linux'), args, { stdio: 'inherit' })
    })

    it('Should suppress the output when the flag is set', async () => {
      mockStringField('getPlatform', 'linux')

      await new VRelease([], true).run()
      expect(spawnSpy).toBeCalledWith(binPath('linux'), [], { stdio: 'ignore' })
    })

    it('Should throw when an unsupported platform is detected', async () => {
      const p = 'android'
      mockStringField('getPlatform', p)

      const c = async (): Promise<void> => await VRelease.builder().run()
      await expect(c).rejects.toThrow(`unsupported platform ${p}`)
    })

    it('Should throw when an unsupported arch is detected', async () => {
      const a = 'ppc'
      mockStringField('getArch', a)

      const c = async (): Promise<void> => await VRelease.builder().run()
      await expect(c).rejects.toThrow(`unsupported architecture ${a}`)
    })
  })
})
