/* globals describe it expect jest */

import path from 'path'
import * as cp from 'child_process'

import { VRelease } from '../src/wrapper'

jest.mock('child_process')

describe('VRelease:', () => {
  describe('Command builder:', () => {
    it('Should build a command with attacheables', () =>
      expect(VRelease.builder().attach('my-file').build()).toEqual(['-attach', 'my-file']))

    it('Should build a command with many attacheables', () =>
      expect(VRelease.builder().attach('one', 'two', 'three').build()).toEqual([
        '-attach',
        'one',
        '-attach',
        'two',
        '-attach',
        'three'
      ]))

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

    it('Should build a complex command', () =>
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
      ).toEqual([
        '-add-description',
        '-add-checksum',
        '-pre-release',
        '-debug',
        '-no-color',
        '-limit',
        '250',
        '-attach',
        'first',
        '-attach',
        'second',
        '-attach',
        'third'
      ]))
  })

  describe('Command runner:', () => {
    const spyedSpawn = jest
      .spyOn(cp, 'spawn')
      // @ts-expect-error
      .mockImplementation((cmd: string, args: readonly string[], opts: cp.SpawnOptions) => {
        return {
          on: (_: string, cb: (v?: any) => void) => cb()
        }
      })

    it('Should run with proper binary', async () => {
      await VRelease.builder().run()

      const bin = path.resolve(__dirname, '..', 'bin', 'vrelease-macos')
      const args: string[] = []
      const opts = { stdio: 'inherit' }

      expect(spyedSpawn).toBeCalledWith(bin, args, opts)
    })
  })
})
