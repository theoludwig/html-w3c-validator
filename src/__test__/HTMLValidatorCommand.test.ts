import test from 'node:test'
import assert from 'node:assert/strict'

import { execa } from 'execa'

import { cli } from '../cli.js'
import { HTMLValidatorCommand } from '../HTMLValidatorCommand.js'

await test('html-w3c-validator', async (t) => {
  await t.test('should be instance of the command', async () => {
    const command = cli.process([])
    assert(command instanceof HTMLValidatorCommand)
  })

  await t.test('succeeds and validate the html correctly', async () => {
    const exampleURL = new URL('../../example', import.meta.url)
    process.chdir(exampleURL.pathname)
    await execa('rimraf', ['node_modules'])
    await execa('npm', ['install'])
    const { exitCode } = await execa('npm', ['run', 'test:html-w3c-validator'])
    assert.strictEqual(exitCode, 0)
  })
})
