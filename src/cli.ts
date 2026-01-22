#!/usr/bin/env node

import { VRelease } from './wrapper'

function runCLI(): void {
  const input = process.argv.slice(2).filter((i) => i.length > 0)

  if (input.length === 0) {
    return
  }

  new VRelease(input).run().catch((e) => {
    const m = e instanceof Error ? e.message : JSON.stringify(e)
    console.error(m)
    process.exit(2)
  })
}

runCLI()
